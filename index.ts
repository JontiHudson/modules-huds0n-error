export class Huds0nError extends Error {
  private static CODE_MISSING = 'CODE_MISSING';
  private static MESSAGE_MISSING = 'Message Missing';

  static errorName = 'Huds0nError';

  private static _typeCheckProps({
    code,
    handled,
    info,
    message,
    severity,
    stack,
  }: Huds0nError.Props) {
    if (code && typeof code !== 'string') {
      throw 'Code needs to be a string';
    }

    if (
      handled &&
      typeof handled !== 'object' &&
      typeof handled !== 'boolean'
    ) {
      throw 'Handled needs to be a boolean or object';
    }

    if (info && typeof info !== 'object') {
      throw 'Info needs to be an object';
    }

    if (message && typeof message !== 'string') {
      throw 'Message needs to be a string';
    }

    if (
      severity !== 'HIGH' &&
      severity !== 'MEDIUM' &&
      severity !== 'LOW' &&
      severity !== 'NONE'
    ) {
      throw 'Severity needs to be either HIGH, MEDIUM, LOW, or NONE';
    }

    if (stack && typeof stack !== 'string') {
      throw 'Stack needs to be a string';
    }
  }

  private static _typeCheckObject({ timestamp, updateHx }: Huds0nError.Object) {
    if (timestamp && typeof timestamp !== 'number') {
      throw 'Timestamp needs to be a number';
    }

    if (updateHx && !Array.isArray(updateHx)) {
      throw 'updateHx needs to be an array';
    }
  }

  static transform(
    error: any,
    defaultProps: Huds0nError.Props,
    overwrite?: boolean,
  ) {
    if (error instanceof Huds0nError) {
      if (overwrite) {
        return error.update(defaultProps);
      }

      error._info = { ...defaultProps.info, ...error._info };
      return error;
    }

    if (error instanceof Error) {
      const { name, message, stack, ...customProps } = error;

      const huds0nError = new Huds0nError({
        ...defaultProps,
        message,
        stack,
        info: { ...defaultProps.info, ...customProps },
      });

      return overwrite ? huds0nError.update(defaultProps) : huds0nError;
    }

    return new Huds0nError({
      ...defaultProps,
      info: { ...defaultProps.info, parentError: error },
    });
  }

  static JSONparse(JSONstring: string) {
    try {
      return JSON.parse(JSONstring, this.JSONreviver);
    } catch (error) {
      const parseError = Huds0nError.transform(error, {
        code: 'PARSE_ERROR',
        message: 'Unable to parse string',
        severity: 'HIGH',
        info: { JSONstring },
      });

      return parseError;
    }
  }

  static JSONreviver(key: string, value: any) {
    if (typeof value === 'object' && value._JSONrev === 'Huds0nError') {
      const { _JSONrev, ...object } = value;

      return Huds0nError.revive(object, Huds0nError);
    }
    return value;
  }

  static revive<C extends new (props: any) => Huds0nError>(
    object: GetReviveProps<C>,
    Class: C,
  ): GetReviveError<C> {
    try {
      Huds0nError._typeCheckObject(object);
    } catch (details) {
      throw new Huds0nError({
        code: 'ERROR_REVIVE_ERROR',
        message: 'Unable to revive error. Check format of object.',
        severity: 'HIGH',
        info: { object, details },
      });
    }

    const error = new Class(object);

    error._timestamp = object.timestamp || Date.now();
    error._updateHx = object.updateHx || [];

    // @ts-ignore
    return error;
  }

  private _code: string | number;
  private _handled: boolean | Object;
  private _info: Huds0nError.Info;
  private _name: string;
  private _message: string;
  private _severity: Huds0nError.Severity;
  private _stack: string | undefined;
  private _timestamp: number;
  private _updateHx: Huds0nError.Hx;

  constructor(props: Huds0nError.Props) {
    try {
      Huds0nError._typeCheckProps(props);

      const message =
        props.message || String(props.code) || Huds0nError.MESSAGE_MISSING;

      super(message);

      this._message = message;
      this._name = props.name || Huds0nError.errorName;
      // @ts-ignore
      this._stack = props.stack || super.stack;

      this._code = props.code || Huds0nError.CODE_MISSING;
      this._handled = props.handled || false;
      this._info = props.info || {};
      this._severity = props.severity || 'HIGH';
      this._timestamp = Date.now();
      this._updateHx = [];
    } catch (details) {
      throw new Huds0nError({
        code: 'ERROR_CONSTRUCT_ERROR',
        message: 'Unable to construct error. Check format of props.',
        severity: 'HIGH',
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

  get message() {
    return this._message;
  }

  get name() {
    return this._name;
  }

  get severity() {
    return this._severity;
  }

  handle(handledInfo?: Huds0nError.Info) {
    if (this._handled) {
      return false;
    }

    this._handled = handledInfo || true;

    console.log('Handled: ' + this.toString());
    return true;
  }

  log(message = this.print()) {
    switch (this._severity) {
      case 'HIGH':
      case 'MEDIUM':
        console.error(message);
        break;
      case 'LOW':
        console.warn(message);
        break;
      default:
      case 'LOW':
        console.log(message);
    }

    return this;
  }

  print() {
    const border =
      '\n---------------------------------------------------------------\n';

    const name = this.toString();
    const info = Object.keys(this._info).length
      ? '\nInfo: ' + JSON.stringify(this._info, null, 2)
      : '';
    const handledInfo =
      typeof this._handled === 'object'
        ? '\nHandled Info: ' + JSON.stringify(this._handled, null, 2)
        : '';
    const updateHx = this._updateHx.length
      ? '\nUpdateHx: ' + JSON.stringify(this._updateHx, null, 2)
      : '';
    const trace = this._stack
      ? this._stack.substring(this._stack.indexOf('\n') + 1)
      : null;

    const contents =
      name +
      '\n' +
      this._message +
      info +
      handledInfo +
      updateHx +
      (trace ? '\n' + trace : '');

    return border + contents + border;
  }

  toObject(): Huds0nError.Object {
    return {
      name: this._name,
      code: this._code,
      handled: this._handled,
      message: this._message,
      severity: this._severity,
      info: this._info,
      stack: this._stack || '',
      timestamp: this._timestamp,
      updateHx: this._updateHx,
    };
  }

  toJSON() {
    return JSON.stringify({
      ...this.toObject(),
      _JSONrev: 'Huds0nError',
    });
  }

  toString() {
    return `${this.name} - ${this.code} (${
      this.severity + (this.handled ? ' - HANDLED' : '')
    })`;
  }

  update(props: Partial<Huds0nError.Props>) {
    const prev: Partial<Huds0nError.Props> & { timestamp: number } = {
      timestamp: this._timestamp,
    };

    this._timestamp = Date.now();

    if (props.code) {
      prev.code = this._code;
      this._code = props.code;
    }
    if (props.info) {
      Object.entries(props.info).forEach(([key, value]) => {
        if (this._info[key]) {
          prev.info ? (prev.info[key] = value) : (prev.info = { [key]: value });
        }
      });

      this._info = { ...this._info, ...props.info };
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

    this._updateHx.push(prev);

    return this;
  }
}

export namespace Huds0nError {
  export type Info = {
    [prop: string]: any;
  };

  export type HandledProp = boolean | Info;

  export type Object = Required<Props> &
    Timestamp & {
      updateHx: Hx;
    };

  export type Props = {
    code: string | number;
    handled?: HandledProp;
    info?: Info;
    message?: string;
    name?: string;
    severity: Severity;
    stack?: string;
  };

  export type Severity = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

  type Timestamp = { timestamp: number };

  export type Hx = (Partial<Props> & Timestamp)[];
}

type GetReviveProps<C> = C extends new (props: infer P) => any ? P : never;
type GetReviveError<C> = C extends new (props: any) => infer E ? E : never;

export default Huds0nError;
