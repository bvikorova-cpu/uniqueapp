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
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun.cloudflare.com:3478" },
  ],
  iceCandidatePoolSize: 10,
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
  const pendingCandidates = new Map<string, RTCIceCandidateInit[]>();
  const channel = supabase.channel(`concert-rtc-${concertId}`, {
    config: { broadcast: { self: false, ack: true } },
  });

  const report = () => onViewerCount?.(peers.size);

  const createPeer = async (viewerId: string) => {
    const existing = peers.get(viewerId);
    if (existing && ["new", "connecting", "connected"].includes(existing.connectionState)) return;
    existing?.close();
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
    await channel.send({
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
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          const queued = pendingCandidates.get(payload.from) ?? [];
          for (const candidate of queued) await pc.addIceCandidate(new RTCIceCandidate(candidate));
          pendingCandidates.delete(payload.from);
        } catch { /* retry is driven by the viewer */ }
      }
    })
    .on("broadcast", { event: "ice" }, async ({ payload }) => {
      if (payload?.to !== "host") return;
      const pc = peers.get(payload?.from);
      if (pc && payload?.candidate) {
        if (!pc.remoteDescription) {
          const queued = pendingCandidates.get(payload.from) ?? [];
          queued.push(payload.candidate);
          pendingCandidates.set(payload.from, queued);
        } else {
          try { await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch { /* ignore invalid candidate */ }
        }
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
      pendingCandidates.clear();
      supabase.removeChannel(channel);
    },
  };
}

export interface ViewerHandle {
  stop: () => void;
  reconnect: () => void;
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
  let connectTimeout: number | undefined;
  const pendingCandidates: RTCIceCandidateInit[] = [];

  const channel = supabase.channel(`concert-rtc-${concertId}`, {
    config: { broadcast: { self: false, ack: true } },
  });

  const sendJoin = () => {
    if (stopped) return;
    void channel.send({ type: "broadcast", event: "join", payload: { from: viewerId } });
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
    peer.onconnectionstatechange = () => {
      onState?.(peer.connectionState);
      if (peer.connectionState === "connected" && connectTimeout) {
        window.clearTimeout(connectTimeout);
        connectTimeout = undefined;
      }
    };
    return peer;
  };

  channel
    .on("broadcast", { event: "offer" }, async ({ payload }) => {
      if (payload?.to !== viewerId || !payload?.sdp) return;
      const peer = ensurePeer();
      try {
        await peer.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        while (pendingCandidates.length > 0) {
          const candidate = pendingCandidates.shift();
          if (candidate) await peer.addIceCandidate(new RTCIceCandidate(candidate));
        }
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        await channel.send({
          type: "broadcast",
          event: "answer",
          payload: { from: viewerId, sdp: peer.localDescription },
        });
        if (connectTimeout) window.clearTimeout(connectTimeout);
        connectTimeout = window.setTimeout(() => {
          if (peer.connectionState !== "connected") onState?.("failed");
        }, 12000);
      } catch { /* ignore */ }
    })
    .on("broadcast", { event: "ice" }, async ({ payload }) => {
      if (payload?.to !== viewerId || !payload?.candidate) return;
      if (!pc?.remoteDescription) {
        pendingCandidates.push(payload.candidate);
        return;
      }
      try { await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch { /* ignore invalid candidate */ }
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
    reconnect: () => {
      pc?.close();
      pc = null;
      pendingCandidates.length = 0;
      onState?.("connecting");
      sendJoin();
    },
    stop: () => {
      stopped = true;
      if (retry) window.clearInterval(retry);
      if (connectTimeout) window.clearTimeout(connectTimeout);
      pc?.close();
      pc = null;
      supabase.removeChannel(channel);
    },
  };
}
