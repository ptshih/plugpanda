# [Plug Panda](https://www.plugpanda.com/)

Nobody knows what it means, but its provocative!

## Configuration

[Configuration](CONFIGURATION.md)

## Reference

[Reference](REFERENCE.md)

## Style Guides

Roughly following these:

- [JS](https://github.com/airbnb/javascript)
- [CSS](https://github.com/airbnb/css)

And to a lesser extent these:

- [CSS](http://codeguide.co/#css)
- [HTML](http://codeguide.co/#html)

SCSS BEM Style:

```
.block {
  background-color: white;

  &--active {
    background-color: gray;
  }

  &__element {
    color: red;

    &--active {
      color: blue;
    }
  }

  &__another-element {
    background-color: red;

    &--active {
      background-color: blue;
    }
  }
}
```

## Dependencies

- [Muni](https://github.com/airbrite/muni)

## Google Maps

- [Static Maps](https://developers.google.com/maps/documentation/static-maps/intro)

## Todo

[Todo](TODO.md)

## Heroku

- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Best Practices for Node.js Development](https://devcenter.heroku.com/articles/node-best-practices)
