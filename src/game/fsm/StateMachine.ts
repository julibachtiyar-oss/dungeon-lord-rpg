// Finite State Machine (GDD §4 & AGENTS.md Rule 3)
// States implement enter/update/exit; no string if-else chains

export interface State<T> {
  name: string;
  enter?: (context: T) => void;
  update?: (context: T, time: number, delta: number) => void;
  exit?: (context: T) => void;
}

export class StateMachine<T> {
  private currentState: State<T> | null = null;
  private states = new Map<string, State<T>>();
  private context: T;

  constructor(context: T) {
    this.context = context;
  }

  addState(state: State<T>): this {
    this.states.set(state.name, state);
    return this;
  }

  setState(name: string): void {
    if (this.currentState?.name === name) return;
    this.currentState?.exit?.(this.context);
    const next = this.states.get(name);
    if (!next) {
      console.warn(`[StateMachine] Unknown state: ${name}`);
      return;
    }
    this.currentState = next;
    this.currentState.enter?.(this.context);
  }

  update(time: number, delta: number): void {
    this.currentState?.update?.(this.context, time, delta);
  }

  getStateName(): string {
    return this.currentState?.name || 'none';
  }
}
