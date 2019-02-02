# Instalinks

A wrapper around [`instafeed.js`](http://instafeedjs.com) to display your feed items with links from their descriptions.

## Insertion

```html
<!-- Append to head -->
<script src="https://cdn.jsdelivr.net/gh/stevenschobert/instafeed.js/instafeed.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/tomatrow/instalinks/build/instalinks.min.js"></script>
```

```html
<!-- Append to body -->
<div id="instalinks"></div>
<script>
    const params = {
        /* Get user id: https://www.instagram.com/USERNAME/?__a=1 */
        userId: 8399716185,
        /* Get token: http://instagram.pixelunion.net */
        accessToken: '8399716185.1677ed0.0b25b9e1b3c84da89100bd2f8b80d23e',
        /* Need access to the instagram API */
        clientId: '5fa9b3d7be894bd1a4060c76bb9cbf9a'
    }
    const instalinks = new Instalinks(params)
    instalinks.run()

</script>
```
