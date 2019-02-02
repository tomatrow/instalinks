const INSTALINKS_STYLES = `body {
    display: flex;
    flex-direction: column;
}

.main-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.feed-list {
    display: flex;
    flex-flow: row wrap;

}

.feed-list::after {
    /* content: ''; */
    /* flex-grow: 1000000000; */
}

.feed-item {
    display: flex;
    flex-direction: column;
}

.load-button {
    font-family: futura-pt, sans-serif;
    font-style: normal;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 12px;
    background-color: #f7ce00;
    border: 0px;
    width: 126px;
    height: 47px;
    text-align: center;
    border-radius: 50px;
    color: white;
}

.load-button[disabled="disabled"] {
    color: black;
    background-color: grey;
}

.load-button:hover:not([disabled="disabled"]) {
    box-shadow: inset 0 0 100px 100px rgba(255, 255, 255, 0.3);
}

@media (min-width:100px) {

    /* portrait e-readers (Nook/Kindle), smaller tablets @ 600 or @ 640 wide. */
    body {
        /* background-color: green; */
    }

    .feed-image {
        width: 100%;
    }

    .feed-list {
        flex-direction: column;
    }
}

@media (min-width:319px) {

    /* portrait tablets, portrait iPad, landscape e-readers, landscape 800x480 or 854x480 phones */
    body {
        /* background-color: red; */
    }

    .feed-item {
        margin: 10px;
        flex: 1 0 150px;
        max-width: 400px;
    }

    .feed-list {
        flex-direction: row;
    }

    .ghost {
        flex: 1 0 150px;
    }
}

@media (min-width:650px) {
    body {
        /* background-color: blue; */
    }

    .feed-item {
        margin: 10px;
        flex: 1 0 250px;
        max-width: 400px;
    }

    .feed-list {
        flex-direction: row;
    }

    .ghost {
        flex: 1 0 250px;
    }
}

.ghost {
    height: 0;
    margin-top: 0;
    margin-bottom: 0;
}`

// Here's what I wrote. We need instafeed.
class Instalinks {
    constructor(instafeedParams) {
        this._addLibraries()
        this.feed = this._createFeed(instafeedParams)
        this.data = []
    }

    static get linkRegex() {
        const linkExpression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi
        const linkRegex = new RegExp(linkExpression)
        return linkRegex
    }

    static get tagTemplate() {
        return `<div class="feed-item">
                    <a class="feed-link" id="{{model.id}}" href="">
                        <img class="feed-image" src="{{image}}"></img>
                    </a>
                </div>`
    }

    static get linkTemplate() {
        return `<div class="feed-item">
                    <a class="feed-link" id="{{model.id}}" href="">
                        <img class="feed-image" src="{{image}}"></img>
                    </a>
                </div>`
    }

    run() {
        this.insert()
        this.feed.run()
    }

    _addLibraries() {
        // apply css if needed
        if (!document.getElementById('instalinks-styles')) {
            const css = document.createElement("style");
            css.type = "text/css";
            css.id = "instalinks-styles"
            css.innerHTML = INSTALINKS_STYLES
            document.head.appendChild(css);
        }
    }

    _createFeed(params) {
        // Save reference to self to pass along
        const self = this

        const defaultOptions = {
            get: 'user',
            sortBy: 'most-recent',
            useHttp: true,
            resolution: 'standard_resolution'
        }

        const modes = {
            LINK: 1,
            TAG: 2,
            NONE: 3
        }

        // Decide on the mode
        let mode = null
        let template = null
        if (params.template) { // the given template
            mode = modes.NONE
            template = params.template
        } else if (params.tagName) { // for tags
            mode = modes.TAG
            template = Instalinks.tagTemplate
        } else { // Use the template that parses for links
            mode = modes.LINK
            template = Instalinks.linkTemplate
        }
        params.template = template

        // filter by caption-links if no tags and filters
        if (!params.filter) {
            if (mode === modes.LINK) {
                params.filter = function(image) {
                    // find the corresponding image
                    const instalinkData = self.data.filter(piece => {
                        return piece.image.id == image.id
                    })[0]

                    // keep images with parsed links
                    return instalinkData.parsedLinks.length > 0
                }
            } else if (mode === modes.TAG) {
                params.filter = function(image) {
                    return image.tags.indexOf(params.tagName) >= 0
                }
            }
        }



        // Merge simple options
        const options = Object.assign({}, params, defaultOptions)

        // success
        options.success = function(response) {
            // execute what was passed
            if (params.success)
                params.success(response)
            // save image data
            const parsedData = response.data.map(image => {
                let match = []
                if (image.caption && image.caption.text)
                    match.push(...image.caption.text.match(Instalinks.linkRegex))

                match = match.map(link => {
                    if (!link.startsWith("http"))
                        return "http://" + link
                    return link
                })

                return {
                    parsedLinks: match,
                    image: image
                }
            })
            self.data.push(...parsedData)
        }

        // after
        options.after = function() {
            // Execute the after passed to us
            if (params.after)
                params.after()
            // Disable load button if there is no more content
            const loadButton = document.getElementById("load")
            if (!this.hasNext())
                loadButton.setAttribute('disabled', 'disabled')

            if (mode !== modes.LINK)
                return

            // Assign parsed links to image anchors
            self.data.forEach(item => {
                if (item.parsedLinks.length === 0)
                    return
                const id = item.image.id
                const anchor = document.getElementById(id)
                anchor.href = item.parsedLinks[0]
            })

            const feed = document.getElementById('instafeed')
            const feedItems = feed.querySelectorAll(".feed-item")
            const ghosts = feed.querySelectorAll(".ghost")
            const ghostCount = feedItems.length * 2 + 1
            const ghostsNeeded = ghostCount - ghosts.length

            console.log(feed, feedItems, ghosts, ghostCount, ghostsNeeded)

            for (let i = 0; i < ghostsNeeded; i++) {
                const ghost = document.createElement('div')
                ghost.className = 'ghost'
                feed.appendChild(ghost)
            }
        }

        return new Instafeed(options)
    }

    insert() {
        // get instalinks element
        const fragment = document.getElementById("instalinks")
        // apply simple html
        fragment.innerHTML = `
            <div id="instafeed" class="feed-list"></div>
            <button class="load-button" id="load" type="button">Load More</button>`
        const loadButton = document.getElementById("load")
        loadButton.addEventListener('click', () => this.feed.next())
    }
}
