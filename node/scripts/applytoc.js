$(function () {
    var $toc = $("#toc"),
        $win = $(window),
        isCollapsing = false,
        setHighlightTimeout,
        oldScroll, winWidth;
    
    function onHighlight($highlighted) {
        if (isCollapsing || winWidth < 768) {
            return;
        }
        
        var $parent = $highlighted.parents(".collapse");
        if ($parent.length) {
            $parent.addClass("in")
                .siblings(".collapse").removeClass("in");
        }
        else if (!$highlighted.next(".collapse").length) {
            $highlighted.siblings(".collapse").removeClass("in");
        }

        var highlightTop = $highlighted.position().top,
            tocTop = $toc.scrollTop(),
            top = tocTop + highlightTop,
            tocHeight = $toc.height(),
            tocMiddle = tocHeight / 2;
        
        if (top >= tocMiddle)
            $toc.scrollTop(top - tocMiddle)
    }
    
    function setToc() {
        $toc.toc({
            selectors: "h1,h2,h3",
            container: "#main",
            activeClass: "active",
            prefix: "jscom",
            
            scrollToOffset: 70,
            highlightOffset: 110,
            
            anchorName: function (i, heading, prefix) {
                return $(heading).attr("id") || (prefix + i);
            },
            headerText: function (i, heading, $heading) {
                return $heading.find(".signature-name, .type-name").text() || $heading.text();
            },
            itemClass: function (i, heading, $heading, prefix) {
                var tagName = $heading[0].tagName.toLowerCase();
                return tagName === "h1" || tagName === "h2" ? "nav-header" : "";
            },
            onHighlight: onHighlight
        });
    }
    
    function afterToc() {
        $toc.children("ul").addClass("nav nav-pills nav-stacked");
        
        $toc.find(".nav-header").each(function () {
            var $this = $(this),
                $nexts = $this.nextUntil(".nav-header");
            
            if ($nexts.length === 0) {
                return;
            }
            
            var id = "toc-collapse-" + $this.text().toLowerCase().replace(/[^\w]/g, "-");
            
            $nexts.wrapAll($("<ul>").addClass("nav nav-pills nav-stacked collapse").attr("id", id));
            
            var child = $this.children("a"),
                oldClick = $._data(child.get(0), "events").click[0];
            
            child.off("click")
                .attr({ "data-toggle": "collapse", "data-target": "#" + id })
                .on("click", function (e) {
                    if (winWidth >= 768) {
                        oldClick.handler.apply(this, arguments);
                    }
                    else {
                        e.preventDefault();
                    }
                });
        });
        
        $toc.find(".collapse")
            .on("show.bs.collapse", function () { $(this).siblings(".collapse").collapse("hide"); });
    }
    
    function setHighlight() {
        winWidth = $win.width();
        if (!oldScroll && winWidth < 768) {
            oldScroll = $._data(window, "events").scroll[0];
            $win.off("scroll");
        }
        else if (oldScroll && winWidth >= 768) {
            $win.on("scroll", oldScroll.handler);
            oldScroll = null;
        }
    }
    
    setToc();
    afterToc();
    setHighlight();
    
    $win.resize(function () {
        clearTimeout(setHighlightTimeout);
        setHighlightTimeout = setTimeout(setHighlight, 50);
    });
});
