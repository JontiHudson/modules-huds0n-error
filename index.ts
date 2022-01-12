import type { Types } from "./types";

type GetReviveProps<C> = C extends new (props: infer P) => any ? P : never;
type GetReviveError<C> = C extends new (props: any) => infer E ? E : never;

export class Huds0nError extends Error {
  private static CODE_MISSING = "CODE_MISSING";
  private static MESSAGE_MISSING = "Message Missing";

  static errorName = "Huds0nError";
  static onCreateError: (error: Huds0nError) => void;

  private static _typeCheckProps({
    code,
    handled,
    info,
    message,
    severity,
    stack,
  }: Types.Props) {
    if (code && typeof code !== "string") {
      throw "Code needs to be a string";
    }

    if (
      handled &&
      typeof handled !== "object" &&
      typeof handled !== "boolean"
    ) {
      throw "Handled needs to be a boolean or object";
    }

    if (info && typeof info !== "object") {
      throw "Info needs to be an object";
    }

    if (message && typeof message !== "string") {
      throw "Message needs to be a string";
    }

    if (
      severity &&
      severity !== "HIGH" &&
      severity !== "MEDIUM" &&
      severity !== "LOW" &&
      severity !== "NONE"
    ) {
      throw "Severity needs to be either HIGH, MEDIUM, LOW, or NONE";
    }

    if (stack && typeof stack !== "string") {
      throw "Stack needs to be a string";
    }
  }

  private static _typeCheckObject({ timestamp, updateHx }: Types.ErrorObject) {
    if (timestamp && typeof timestamp !== "number") {
      throw "Timestamp needs to be a number";
    }

    if (updateHx && !Array.isArray(updateHx)) {
      throw "updateHx needs to be an array";
    }
  }

  static transform(
    error: any,
    defaultError: Types.Props | string,
    overwrite?: boolean
  ) {
    const defaultProps: Types.Props =
      typeof defaultError === "string" ? { code: defaultError } : defaultError;

    let transformedError: Huds0nError;

    if (error instanceof Huds0nError) {
      transformedError = error;
    } else if (error instanceof Error) {
      const { message, stack } = error;

      transformedError = new Huds0nError({
        ...defaultProps,
        message,
        stack,
        info: { ...defaultProps.info },
      });
      transformedError._parent = error;
    } else {
      transformedError = new Huds0nError({
        ...defaultProps,
        info: { ...defaultProps.info, parentError: error },
      });
      transformedError._parent = error;
    }

    if (overwrite) {
      transformedError.update(defaultProps);
    }

    return transformedError;
  }

  static JSONparse(JSONstring: string) {
    try {
      return JSON.parse(JSONstring, this.JSONreviver);
    } catch (error) {
      throw Huds0nError.transform(error, {
        code: "PARSE_ERROR",
        message: "Unable to parse string",
        severity: "HIGH",
        info: { JSONstring },
      });
    }
  }

  static JSONreviver(key: string, value: any) {
    if (
      value &&
      typeof value === "object" &&
      value._JSONrev === "Huds0nError"
    ) {
      const { _JSONrev, ...object } = value;

      return Huds0nError.revive(object, Huds0nError);
    }
    return value;
  }

  static revive<C extends new (props: any) => Huds0nError>(
    object: GetReviveProps<C>,
    Class: C
  ): GetReviveError<C> {
    try {
      Huds0nError._typeCheckObject(object);
    } catch (e) {
      throw Huds0nError.transform(e, {
        code: "ERROR_REVIVE_ERROR",
        message: "Unable to revive error. Check format of object.",
        severity: "HIGH",
        info: { object },
      });
    }

    const error = new Class(object);

    error._timestamp = object.timestamp || Date.now();
    error._updateHx = object.updateHx || [];
    error._revived = true;

    // @ts-ignore
    return error;
  }

  private _code: string | number;
  private _handled: boolean | Object;
  private _info: Types.Info;
  private _name: string;
  private _message: string;
  private _parent: any;
  private _revived: boolean;
  private _severity: Types.Severity;
  private _stack: string | undefined;
  private _timestamp: number;
  private _updateHx: Types.UpdateHx;

  constructor(props: Types.Props | string) {
    const _props: Types.Props =
      typeof props === "string" ? { code: props, severity: "HIGH" } : props;

    try {
      Huds0nError._typeCheckProps(_props);

      const message =
        _props.message || String(_props.code) || Huds0nError.MESSAGE_MISSING;

      super(message);

      this._message = message;
      this._name = _props.name || Huds0nError.errorName;
      // @ts-ignore
      this._stack = _props.stack || super.stack;

      this._code = _props.code || Huds0nError.CODE_MISSING;
      this._handled = _props.handled || false;
      this._info = _props.info || {};
      this._revived = false;
      this._severity = _props.severity || "HIGH";
      this._timestamp = Date.now();
      this._updateHx = [];

      Huds0nError.onCreateError?.(this);
    } catch (details) {
      throw new Huds0nError({
        code: "ERROR_CONSTRUCT_ERROR",
        message: "Unable to construct error. Check format of props.",
        severity: "HIGH",
        info: { props, details },
      });
    }
  }

  get code() {
    return this._code;
  }

  get handled() {
    return this._handled;
  }

  get info() {
    return this._info;
  }

  get parent() {
    return this._parent;
  }

  get message() {
    return this._message;
  }

  get name() {
    return this._name;
  }

  get revived() {
    return this._revived;
  }

  get severity() {
    return this._severity;
  }

  handle(handledInfo?: Types.Info) {
    if (this._handled) {
      return false;
    }

    this._handled = handledInfo || true;

    console.log("Handled: " + this.toString());
    return true;
  }

  log(message = this.toStringLong()) {
    switch (this._severity) {
      case "HIGH":
      case "MEDIUM":
        console.error(message);
        break;
      case "LOW":
        console.warn(message);
        break;
      default:
        console.log(message);
    }

    return this;
  }

  toObject(): Types.ErrorObject {
    return {
      name: this._name,
      code: this._code,
      handled: this._handled,
      message: this._message,
      severity: this._severity,
      info: this._info,
      stack: this._stack || "",
      timestamp: this._timestamp,
      updateHx: this._updateHx,
    };
  }

  toJSON() {
    return JSON.stringify({
      ...this.toObject(),
      _JSONrev: "Huds0nError",
    });
  }

  toString() {
    return `${this.name} - ${this.code} (${
      this.severity + (this.handled ? " - HANDLED" : "")
    })`;
  }

  toStringLong() {
    const border =
      "\n---------------------------------------------------------------\n";

    const name = this.toString();
    const info = Object.keys(this._info).length
      ? "\nInfo: " + JSON.stringify(this._info, null, 2)
      : "";
    const handledInfo =
      typeof this._handled === "object"
        ? "\nHandled Info: " + JSON.stringify(this._handled, null, 2)
        : "";
    const updateHx = this._updateHx.length
      ? "\nUpdateHx: " + JSON.stringify(this._updateHx, null, 2)
      : "";
    const trace = this._stack
      ? this._stack.substring(this._stack.indexOf("\n") + 1)
      : null;

    const contents =
      name +
      "\n" +
      this._message +
      info +
      handledInfo +
      updateHx +
      (trace ? "\n" + trace : "");

    return border + contents + border;
  }

  update(props: Partial<Types.Props>) {
    const prev: Partial<Types.Props> & { timestamp: number } = {
      timestamp: this._timestamp,
    };
    this._timestamp = Date.now();
    if (props.code) {
      prev.code = this._code;
      this._code = props.code;
    }
    if (props.handled !== undefined) {
      prev.handled = this._handled;
      this._handled = props.handled;
    }
    if (props.message) {
      prev.message = this._message;
      this._message = props.message;
    }
    if (props.name) {
      prev.name = this._name;
      this._name = props.name;
    }
    if (props.stack) {
      prev.stack = this._stack;
      this._stack = props.stack;
    }
    if (props.severity) {
      prev.severity = this._severity;
      this._severity = props.severity;
    }
    if (props.info) {
      Object.entries(props.info).forEach(([key, value]) => {
        if (this._info[key] !== value) {
          prev.info = prev.info || {};
          prev.info[key] = this.info[key];
          this.info[key] = value;
        }
      });
    }
    this._updateHx.push(prev);
    return this;
  }
}

export type { Types as ErrorTypes } from "./types";

export default Huds0nError;
