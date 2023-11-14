PubSub Project
==============

Overview
--------

The PubSub project implements a simple yet powerful Publish/Subscribe pattern in JavaScript, enabling efficient and decoupled communication between different parts of your application. It's designed to be lightweight, easy to use, and flexible enough to cover a wide range of use cases.

Features
--------

*   **Event Management**: Efficiently manage event subscriptions and publications.
*   **Customizable Event Tracking**: Option to track event publications.
*   **Extended Logging and Error Handling**: Specialized PubSub instances for logging (`Logs`) and error handling (`Errors`).
*   **ES6 Module Support**: Written as ES6 modules, making it modern and tree-shakable.
*   **Test Suite**: Includes a comprehensive Jest test suite.

Installation
------------

To install the PubSub library, use npm or yarn:

```sh
npm install @nyteshade/ne-pubsub
```

or

```sh
yarn add @nyteshade/ne-pubsub
```

Usage
-----

Here's a quick example to get you started:



```js
import { PubSub } from '@nyteshade/ne-pubsub';

// Create a PubSub instance
const myPubSub = new PubSub('MyPubSub', ['event1', 'event2']);

// Subscribe to an event
myPubSub.listen('event1', (data) => console.log(`Received: ${data}`));

// Publish an event
myPubSub.publish('event1', 'Hello World!');
```

API Reference
-------------

### `PubSub` Class

*   `constructor(name, eventNames, [options])`: Initializes a new instance of PubSub.
*   `addEvent(eventName, ...subscribers)`: Adds a new event to track.
*   `listen(eventName, subscriber, [thisObj], [options])`: Subscribes to an event.
*   `unlisten(eventName, subscriber)`: Unsubscribes from an event.
*   `publish(eventName, ...args)`: Publishes an event to all subscribers.

### Specialized Instances

*   `Logs`: For logging purposes.
*   `Errors`: For error handling.

Testing
-------

To run the test suite, use the following command:

```sh
npm test
```

Contributing
------------

Contributions are always welcome! Please follow these steps to contribute:

1.  **Fork the Repository**: Create your own fork of the project.
2.  **Create a Feature Branch**: Make your changes in a new branch.
3.  **Run Tests**: Ensure that all tests pass with your changes.
4.  **Submit a Pull Request**: Open a PR with a clear list of what you've done.

### Reporting Issues

If you find any bugs or have a feature request, please file an issue in the GitHub issue tracker.

License
-------

This project is licensed under [MIT License](LICENSE).
