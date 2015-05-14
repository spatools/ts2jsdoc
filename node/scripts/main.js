(function () {
    function getSearch() {
        var searchItems = [], searchMap = {},
            i = 0, len = searchMembers.length,
            name;
        
        for (; i < len; i++) {
            name = searchMembers[i].longname || searchMembers[i].name;
            searchItems.push(name);
            searchMap[name] = searchMembers[i];
        }
        
        return {
            items: searchItems,
            map: searchMap
        };
    }
    
    function createDataSet(items) {
        var engine = new Bloodhound({
            local: items,
            //local: searchMembers,
            //identify: function (item) { return item.longname || item.name; },
            queryTokenizer: Bloodhound.tokenizers.nonword,
            datumTokenizer: Bloodhound.tokenizers.nonword
        });
        
        return {
            name: "Symbols",
            source: engine,
            templates: {
                suggestion: function (context) {
                    return $("<a>").attr("href", "javascript:void").text(context);
                }
            }
        };
    }
    
    function configureTypeahead() {
        var search = getSearch();
        $(".typeahead").typeahead({
            hint: true,
            highlight: true,
            minLength: 1,
            classNames: {
                menu: "list-group",
                suggestion: "list-group-item",
                highlight: "text-primary"
            }
        }, createDataSet(search.items));
        
        $(".typeahead").bind("typeahead:select", function (e, suggestion) {
            var url = $(search.map[suggestion].link).get(0);
            window.location.href = url.href;
        });
        
        $(".input-group .twitter-typeahead").css("display", "table-cell");
    }
    
    function configureLocalScroll() {
        if ($.localScroll) {
            $.localScroll({
                offset: { top: -70 },
                onAfter: function (target) {
                    target.click();
                }
            });
        }
    }
    
    function configureSidebar() {
        var $win = $(window),
            $sidebar = $(".sidebar"),
            $aside = $sidebar.children("aside"),
            isScrollable = null;
        
        function onResize() {
            if (isScrollable !== false && $win.width() < 768) {
                isScrollable = false;
                $win.off(".affix");
                $sidebar.removeClass("affix affix-top affix-bottom").removeData("bs.affix");;
                $aside.removeClass("scrollable").css("height", "auto");
            }
            else if (isScrollable !== true && $win.width() >= 768) {
                isScrollable = true;
                $sidebar.affix({ top: 70, bottom: 0 });
                $aside.addClass("scrollable").css("height", String($win.height() - 80) + "px");
            }
        }
    
        onResize();
        $win.resize(onResize);
    }

    $(function () {
        configureLocalScroll();
        configureTypeahead();
        configureSidebar();
    });

})();
