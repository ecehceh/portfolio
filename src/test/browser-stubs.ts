/*
 * Minimal stand-ins for browser APIs jsdom lacks. Tests drive them through
 * setMediaMatches() and intersect().
 */
type IntersectionCallback = (entries: Array<Pick<IntersectionObserverEntry, 'isIntersecting' | 'target'>>) => void;

const matchingQueries = new Set<string>();

/** Makes window.matchMedia(query).matches true for exactly these queries. */
export function setMediaMatches(queries: string[]): void {
  matchingQueries.clear();
  queries.forEach((query) => matchingQueries.add(query));
}

class StubIntersectionObserver {
  static instances: StubIntersectionObserver[] = [];
  readonly targets = new Set<Element>();

  constructor(private readonly callback: IntersectionCallback) {
    StubIntersectionObserver.instances.push(this);
  }

  observe(target: Element) {
    this.targets.add(target);
  }

  unobserve(target: Element) {
    this.targets.delete(target);
  }

  disconnect() {
    this.targets.clear();
  }

  takeRecords() {
    return [];
  }

  trigger(target: Element, isIntersecting: boolean) {
    if (this.targets.has(target)) this.callback([{ target, isIntersecting }]);
  }
}

/** Reports `target` entering or leaving the viewport to every observer watching it. */
export function intersect(target: Element, isIntersecting: boolean): void {
  StubIntersectionObserver.instances.forEach((observer) => observer.trigger(target, isIntersecting));
}

export function installBrowserStubs(): void {
  window.matchMedia = (query: string) =>
    ({
      matches: matchingQueries.has(query),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
  window.IntersectionObserver = StubIntersectionObserver as unknown as typeof IntersectionObserver;
}

export function resetBrowserStubs(): void {
  matchingQueries.clear();
  StubIntersectionObserver.instances = [];
}
