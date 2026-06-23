export const ROUTE_LOADING_EVENT = "axiony:route-loading";

export function startRouteLoading(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ROUTE_LOADING_EVENT));
}
