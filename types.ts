export declare namespace Types {
  export type Props = {
    code: string | number;
    handled?: boolean | Info;
    info?: Info;
    message?: string;
    name?: string;
    severity?: Severity;
    stack?: string;
  };

  export type Info = Record<string, any>;

  export type Severity = "HIGH" | "MEDIUM" | "LOW" | "NONE";

  export type ErrorObject = Required<Props> & {
    timestamp: number;
    updateHx: UpdateHx;
  };

  export type UpdateHx = (Partial<Props> & { timestamp: number })[];
}
