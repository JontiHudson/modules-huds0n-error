import type { Types } from './types';

export class Huds0nError<I extends Types.Info = Types.Info> extends Error {
  private static CODE_MISSING = 'CODE_MISSING';
  private static MESSAGE_MISSING = 'Message Missing';

  static errorName = 'Huds0nError';
  static onCreateError: (error: Huds0nError<Types.Info>) => void;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  private static _typeCheckProps({
    code,
    handled,
    info,
    message,
    severity,
    stack,
  }: Types.Props<Types.Info>) {
    if (code && typeof code !== 'string') {
      throw new Error('Code needs to be a string');
    }

    if (
      handled &&
      typeof handled !== 'object' &&
      typeof handled !== 'boolean'
    ) {
      throw new Error('Handled needs to be a boolean or object');
    }

    if (info && typeof info !== 'object') {
      throw new Error('Info needs to be an object');
    }

    if (message && typeof message !== 'string') {
      throw new Error('Message needs to be a string');
    }

    if (
      severity &&
      severity !== 'DEBUG' &&
      severity !== 'ERROR' &&
      severity !== 'INFO' &&
      severity !== 'WARN'
    ) {
      throw new Error(
        'Severity needs to be either ERROR, INFO, WARN, or DEBUG',
      );
    }

    if (stack && typeof stack !== 'string') {
      throw new Error('Stack needs to be a string');
    }
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  private static _typeCheckObject({
    timestamp,
    updateHx,
  }: Types.ErrorObject<Types.Info>) {
    if (timestamp && typeof timestamp !== 'number') {
      throw new Error('Timestamp needs to be a number');
    }

    if (updateHx && !Array.isArray(updateHx)) {
      throw new Error('updateHx needs to be an array');
    }
  }

  static create<I extends Types.Info>(
    props: Types.CreateProps<I>,
  ): Huds0nError<I & { parentError?: object }> {
    if (!props.from) {
      return new Huds0nError<I>(props);
    }

    const { from, overwrite } = props;

    let transformedError: Huds0nError<I>;

    if (from instanceof Huds0nError<I>) {
      transformedError = from;
      if (!overwrite && props.info) {
        transformedError._info = { ...props.info, ...transformedError._info };
      }
    } else if (typeof from === 'object') {
      const { message, stack } = from as any;

      transformedError = new Huds0nError<I & { parentError: object }>({
        ...props,
        message: message || props.message,
        stack,
        info: { parentError: { ...from }, ...props.info } as I & {
          parentError: object;
        },
      });

      transformedError._parent = from;
    } else {
      transformedError = new Huds0nError<I>({
        ...props,
        ...(typeof from === 'string' && { message: from }),
      });

      transformedError._parent = from;
    }

    if (overwrite) {
      transformedError.update(props);
    }

    return transformedError;
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  static JSONparse(jsonString: string) {
    try {
      return JSON.parse(jsonString, this.JSONreviver);
    } catch (error) {
      throw Huds0nError.create({
        code: 'PARSE_ERROR',
        message: 'Unable to parse string',
        severity: 'ERROR',
        info: { jsonString },
        from: error,
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  static JSONreviver(key: string, value: any) {
    if (
      value &&
      typeof value === 'object' &&
      value._JSONrev === 'Huds0nError'
    ) {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { _JSONrev, ...object } = value;

      return Huds0nError.revive(object);
    }
    return value;
  }

  static revive<I extends Types.Info>(
    object: Types.ErrorObject<I>,
  ): Huds0nError<I> {
    try {
      Huds0nError._typeCheckObject(object);
    } catch (e) {
      throw Huds0nError.create({
        code: 'ERROR_REVIVE_ERROR',
        message: 'Unable to revive error. Check format of object.',
        severity: 'ERROR',
        info: { object },
        from: e,
      });
    }

    const error = new Huds0nError<I>(object);

    error._timestamp = object.timestamp || Date.now();
    error._updateHx = object.updateHx || [];
    error._revived = true;

    return error;
  }

  private _code: string | number;
  private _handled: boolean | object;
  private _info: I;
  private _name: string;
  private _message: string;
  private _parent: any;
  private _revived: boolean;
  private _severity: Types.Severity;
  private _stack: string | undefined;
  private _timestamp: number;
  private _updateHx: Types.UpdateHx<I>;

  private constructor(props: Types.Props<I> | string) {
    const _props: Types.Props<I> =
      typeof props === 'string' ? { code: props, severity: 'ERROR' } : props;

    try {
      Huds0nError._typeCheckProps(_props);

      const message =
        _props.message || String(_props.code) || Huds0nError.MESSAGE_MISSING;

      super(message);

      this._message = message;
      this._name = _props.name || Huds0nError.errorName;
      this._stack = _props.stack || super.stack;

      this._code = _props.code || Huds0nError.CODE_MISSING;
      this._handled = _props.handled || false;
      this._info = _props.info || ({} as I);
      this._revived = false;
      this._severity = _props.severity || 'ERROR';
      this._timestamp = Date.now();
      this._updateHx = [];

      Huds0nError.onCreateError?.(this);
    } catch (details) {
      throw new Huds0nError({
        code: 'ERROR_CONSTRUCT_ERROR',
        message: 'Unable to construct error. Check format of props.',
        severity: 'ERROR',
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

    console.log('Handled: ' + this.toString());
    return true;
  }

  log(message = this.toStringLong()) {
    switch (this._severity) {
      case 'ERROR':
        console.error(message);
        break;
      case 'WARN':
        console.warn(message);
        break;
      default:
        console.log(message);
    }

    return this;
  }

  toObject(): Types.ErrorObject<I> {
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

  toStringLong() {
    const border =
      '\n---------------------------------------------------------------\n';

    const name = this.toString();
    const info = Object.keys(this._info).length
      ? '\nInfo: ' + JSON.stringify(this._info, undefined, 2)
      : '';
    const handledInfo =
      typeof this._handled === 'object'
        ? '\nHandled Info: ' + JSON.stringify(this._handled, undefined, 2)
        : '';
    const updateHx = this._updateHx.length
      ? '\nUpdateHx: ' + JSON.stringify(this._updateHx, undefined, 2)
      : '';
    const trace = this._stack
      ? this._stack.substring(this._stack.indexOf('\n') + 1)
      : undefined;

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

  update(props: Partial<Types.Props<I>>) {
    const prev: Partial<Types.Props<I>> & { timestamp: number } = {
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
          prev.info = prev.info || ({} as I);
          prev.info[key as keyof I] = this.info[key];
          this.info[key as keyof I] = value;
        }
      });
    }
    this._updateHx.push(prev);
    return this;
  }
}

export type { Types as ErrorTypes } from './types';

export default Huds0nError;
