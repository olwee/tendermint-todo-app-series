module.exports = {
    "env": {
        "es6": true,
        "mocha": true,
    },
    "parserOptions": {
        "sourceType": "module",
    },
    "extends": ["eslint:recommended", "airbnb"],
    "rules": {
        "no-throw-literal": 0,
        "react/jsx-indent": 0,
        "max-classes-per-file": 0
    }
}
