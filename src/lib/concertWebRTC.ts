import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight WebRTC live streaming for Live Concerts.
 * Signaling runs over Supabase Realtime broadcast on channel `concert-rtc-<concertId>`.
 * The artist (broadcaster) shares their camera; each ticket holder gets its own peer connection.
 */

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export interface BroadcastHandle {
  stop: () => void;
  onViewerCount?: (n: number) => void;
}

export function startBroadcast(
  concertId: string,
  stream: MediaStream,
  onViewerCount?: (n: number) => void
): BroadcastHandle {
  const peers = new Map<string, RTCPeerConnection>();
  const channel = supabase.channel(`concert-rtc-${concertId}`, {
    config: { broadcast: { self: false } },
  });

  const report = () => onViewerCount?.(peers.size);

  const createPeer = async (viewerId: string) => {
    peers.get(viewerId)?.close();
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peers.set(viewerId, pc);
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        channel.send({
          type: "broadcast",
          event: "ice",
          payload: { to: viewerId, from: "host", candidate: e.candidate.toJSON() },
        });
      }
    };
    pc.onconnectionstatechange = () => {
      if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
        pc.close();
        peers.delete(viewerId);
        report();
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    channel.send({
      type: "broadcast",
      event: "offer",
      payload: { to: viewerId, sdp: pc.localDescription },
    });
    report();
  };

  channel
    .on("broadcast", { event: "join" }, ({ payload }) => {
      if (payload?.from) void createPeer(payload.from);
    })
    .on("broadcast", { event: "answer" }, async ({ payload }) => {
      const pc = peers.get(payload?.from);
      if (pc && payload?.sdp) {
        try { await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp)); } catch { /* ignore */ }
      }
    })
    .on("broadcast", { event: "ice" }, async ({ payload }) => {
      if (payload?.to !== "host") return;
      const pc = peers.get(payload?.from);
      if (pc && payload?.candidate) {
        try { await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch { /* ignore */ }
      }
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.send({ type: "broadcast", event: "live", payload: {} });
      }
    });

  return {
    stop: () => {
      peers.forEach((pc) => pc.close());
      peers.clear();
      supabase.removeChannel(channel);
    },
  };
}

export interface ViewerHandle {
  stop: () => void;
}

export function startViewer(
  concertId: string,
  onStream: (stream: MediaStream) => void,
  onState?: (state: RTCPeerConnectionState) => void
): ViewerHandle {
  const viewerId =
    (globalThis.crypto?.randomUUID?.() as string) || `v-${Math.random().toString(36).slice(2)}`;
  let pc: RTCPeerConnection | null = null;
  let stopped = false;
  let retry: number | undefined;

  const channel = supabase.channel(`concert-rtc-${concertId}`, {
    config: { broadcast: { self: false } },
  });

  const sendJoin = () => {
    if (stopped) return;
    channel.send({ type: "broadcast", event: "join", payload: { from: viewerId } });
  };

  const ensurePeer = () => {
    if (pc) { pc.close(); pc = null; }
    const peer = new RTCPeerConnection(ICE_SERVERS);
    pc = peer;
    peer.ontrack = (e) => {
      if (e.streams[0]) onStream(e.streams[0]);
    };
    peer.onicecandidate = (e) => {
      if (e.candidate) {
        channel.send({
          type: "broadcast",
          event: "ice",
          payload: { to: "host", from: viewerId, candidate: e.candidate.toJSON() },
        });
      }
    };
    peer.onconnectionstatechange = () => onState?.(peer.connectionState);
    return peer;
  };

  channel
    .on("broadcast", { event: "offer" }, async ({ payload }) => {
      if (payload?.to !== viewerId || !payload?.sdp) return;
      const peer = ensurePeer();
      try {
        await peer.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        channel.send({
          type: "broadcast",
          event: "answer",
          payload: { from: viewerId, sdp: peer.localDescription },
        });
      } catch { /* ignore */ }
    })
    .on("broadcast", { event: "ice" }, async ({ payload }) => {
      if (payload?.to !== viewerId || !pc || !payload?.candidate) return;
      try { await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch { /* ignore */ }
    })
    .on("broadcast", { event: "live" }, () => sendJoin())
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        sendJoin();
        retry = window.setInterval(() => {
          if (!pc || !["connected", "connecting"].includes(pc.connectionState)) sendJoin();
        }, 5000);
      }
    });

  return {
    stop: () => {
      stopped = true;
      if (retry) window.clearInterval(retry);
      pc?.close();
      pc = null;
      supabase.removeChannel(channel);
    },
  };
}
