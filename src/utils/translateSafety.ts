/**
 * Google Translate rewrites text nodes in place, which breaks React's DOM
 * bookkeeping: React later tries to remove/insert a node that no longer has
 * the expected parent and throws NotFoundError, blowing up the whole page
 * ("Something went wrong"). These tolerant wrappers keep the app alive when a
 * translated node was moved by the translator.
 *
 * Well-known mitigation, applied once at boot and safe when no translator is
 * active (the fast path is identical to the native behaviour).
 */
let installed = false;

export function installTranslateSafety() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) {
      // The translator re-parented the node — drop it where it actually lives.
      try {
        child.parentNode?.removeChild(child);
      } catch {}
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  } as typeof Node.prototype.removeChild;

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) {
      // Reference node was moved by the translator — append instead of failing.
      try {
        this.appendChild(node);
      } catch {}
      return node;
    }
    return originalInsertBefore.call(this, node, ref) as T;
  } as typeof Node.prototype.insertBefore;
}
