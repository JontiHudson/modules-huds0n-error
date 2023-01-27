export declare namespace Types {
  export type Props<I extends Info> = {
    code: string | number;
    handled?: boolean | Info;
    info?: I;
    message?: string;
    name?: string;
    severity?: Severity;
    stack?: string;
  };

  export type Info = Partial<Record<string, any>>;

  export type Severity = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

  export type ErrorObject<I extends Info> = Required<Props<I>> & {
    timestamp: number;
    updateHx: UpdateHx<I>;
  };

  export type CreateProps<I extends Info> = Omit<Props<I>, 'stack'> & {
    from?: unknown;
    overwrite?: boolean;
  };

  export type UpdateHx<I extends Info> = (Partial<Props<I>> & {
    timestamp: number;
  })[];
}
