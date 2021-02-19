</p>

<h2 align="center">@huds0n/error</h3>

</p>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![GitHub Issues](https://img.shields.io/github/issues/JontiHudson/modules-huds0n-error.svg)](https://github.com/JontiHudson/modules-huds0n-error/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/JontiHudson/modules-huds0n-error.svg)](https://github.com/JontiHudson/modules-huds0n-error/pulls)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---

<p align="center"> An informative extended error.
</p>

</br>

## 📝 Table of Contents

- [About](#about)
- [Features](#features)
- [Getting Started](#getting_started)
- [Basic Usage](#basic_usage)
  - [Creating](#basic_creating)
  - [Handling](#basic_handling)
  - [Updating](#basic_updating)
  - [Displaying](#basic_displaying)
  - [Transforming](#basic_transform)
- [Advanced Usage](#advanced_usage)
  - [Reviving](#advanced_revive)
- [Reference](#reference)
  - [Error Props](#reference_error_props)
- [Authors](#authors)
- [Acknowledgments](#acknowledgement)

</br>

## 🧐 About <a name = "about"></a>

Error Class extending on JavaScript's **Error**, adding in additional properties, such as: code, severity, handled, ect...

Used throughout the Huds0n modules libary.

</br>

## ✅ List of Features <a name = "features"></a>

- **Informative:** _Adds typed props for code, severity, info, and more._
- **Current:** _Easily updated or flagged as handled._
- **Lossless:** _Update history is stored._
- **Typed:** _Fully integrated with typescript out-of-the-box._
- **Transferable:** _Built-in methods to JSON stringify and parse._

</br>

## 🏁 Getting Started <a name = "getting_started"></a>

### **Installing**

```
npm i @huds0n/error
```

</br>

## 🧑‍💻 Basic Usage <a name="basic_usage"></a>

### **Creating an Error**<a name="basic_creating"></a>

```js
import { Huds0nError } from '@huds0n/error';

// Or with node

const { HudsonError } = require('@huds0n/error');

const exampleError = new Huds0nError(errorProps);
```

_See reference for [errorProps](#reference_error_props)_

</br>

### **Handling an Error**<a name="basic_handling"></a>

```js
exampleError.handled(handledProps);
```

_Handled props is an optional object that adds handled info to the error._

</br>

### **Updating an Error**<a name="basic_updating"></a>

```js
exampleError.update(props);
```

_The new properties are added to the error. Overwritten properties are pushed to the update history, which can be seen on error printing._

</br>

### **Displaying an Error**<a name="basic_displaying"></a>

_For concise logging use the **toString** method._

```js
console.log(exampleError.toString());

/*
  Huds0nError - EXAMPLE_ERROR (MEDIUM - HANDLED)
*/
```

_For detailed information use the **print** method._

```js
console.log(exampleError.print());

/*
  
  ---------------------------------------------------------------

  Huds0nError - EXAMPLE_ERROR (MEDIUM - HANDLED)
  Info: {
    ...info is stringified here
  }
  HandledInformation: {
    ...if error's handled flag is an object it is stringified here
  }
  UpdateHx: [...array of overwritten error properties with timestamps]
  ...stack trace

  ---------------------------------------------------------------

*/
```

</br>

### **Transforming an Error**<a name="basic_transform"></a>

Sometimes may need to convert an error into a Huds0nError, i.e. a catch block. For this, use the static **transform** method.

```js
try {
  // Some code
} catch (e) {
  const caughtError = Huds0nError.transform(e, errorProps);
}
```

_The **transform error** converts any type into a **Huds0nError**. [ErrorProps](#reference_error_props) are then merged to create the **Huds0nError**, with additional information being placed in the info prop. If the error being transformed is already a **Huds0nError** it is left unchanged with only the info props being merged._

</br>

## 🧑‍🔬 Advanced Usage <a name="advanced_usage"></a>

### **Reviving an Error**<a name="advanced_revive"></a>

**HudsOnErrors** can easily be turned into JSON with the instance method **toJSON**, then parsed back to a **Huds0nError** using the static method **JSONreviver**

```js
const stringifiedError = exampleError.toJSON();

const revivedError = JSON.parse(stringifiedError, Huds0nError.JSONreviver);
```

## 📖 Reference <a name="reference"></a>

### **Error Props**<a name="reference_error_props"></a>

| Prop     |    Required/(_Default_)     | Description                               | Type                                   |
| -------- | :-------------------------: | ----------------------------------------- | -------------------------------------- |
| code     |              ✔              | user defined error code                   | _string_ or _number_                   |
| handled  |           _false_           | whether error has been handle             | _boolean_ or _object_                  |
| info     |            _{}_             | additional information                    | _object_                               |
| message  |      _Message Missing_      | human-readable error message              | _string_                               |
| name     |        _Huds0nError_        | error name</br>useful for grouping errors | _string_                               |
| severity |              ✔              | severity of error                         | _HIGH_, _MEDIUM_,</br>_LOW_, or _NONE_ |
| stack    | (_Inherited from JS Error_) | trace of error                            | string                                 |

</br>

## ✍️ Authors <a name = "authors"></a>

- [@JontiHudson](https://github.com/JontiHudson) - Idea & Initial work
- [@MartinHudson](https://github.com/martinhudson) - Support & Development

See also the list of [contributors](https://github.com/JontiHudson/modules-huds0n-error/contributors) who participated in this project.

</br>

## 🎉 Acknowledgements <a name = "acknowledgement"></a>

- Special thanks to my fiance, Arma, who has been so patient with all my extra-curricular work.
