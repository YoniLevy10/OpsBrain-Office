/** Bust ISR/cache and refresh server components. */
export async function refreshPageData(router: { refresh: () => void }): Promise<boolean> {
  try {
    const res = await fetch("/api/refresh", { method: "POST" });
    if (!res.ok) return false;
    router.refresh();
    return true;
  } catch {
    return false;
  }
}
