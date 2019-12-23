
var base = getMyURL();
var fin = 0;
var cnt = 0;


$(function() {
    repositories_search();
});


function repositories_search() {
    $.ajax({
        url: base + '?tab=repositories',
        type: 'GET',
        success: function(res) {
            var repos = jQuery($.parseHTML(res));
            var repo_list = repos.filter('#user-repositories-list');
            var a = repo_list.find('a');
            var url_list = [];
            $.each(a, function(index, name) {
                url_list.push($(name).attr('href'));
            });
            imageSearch(url_list);
            var timer = setInterval(function() {
                if(cnt != 0 && fin == cnt) {
                    clearInterval(timer);
                    onComplete();
                }
            }, 2000);
        }
    });
}


var image_list = []
function imageSearch(url_list) {
    cnt += url_list.length;
    for(var i = 0; i < url_list.length; i++) {
        let dest = "https://github.com" + url_list[i];
        var uri = url_list[i];
        $.ajax({
            url: dest,
            type: 'GET',
            success: function(res) {
                var content = jQuery($.parseHTML(res));
                //console.log(content);
                var items = content.find('.file-wrap').find('tr[class="js-navigation-item"]');
                //console.log(items);
                $.each(items, function(index, item) {
                    var type = $(item).find('svg').attr('aria-label');
                    // console.log(type);
                    if(type == 'directory') {
                        var next = $(item).find('a').attr('href')
                        imageSearch([next]);
                    } else {
                        var text = $(item).find('.content').find('a').attr('title');
                        uri = uri.replace(/\/tree/g, '');
                        if(text.match(/.jpg|.png|.gif|.jpeg|.eps/i)) image_list.push("https://raw.githubusercontent.com" + uri + "/" + text);
                    }
                });
            },
            complete: function() {
                fin++;
            }
        });
    }
}

function onComplete() {
    console.log(image_list)
    console.log('finished!')

    var content = document.getElementsByClassName("repository-content")[0];//$('.repository-content');
    var tools = document.getElementsByClassName("file-actions")[0];//$(content).find('.file-actions');
    /*
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute("d", "M6 5h2v2H6V5zm6-.5V14c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1h7.5L12 4.5zM11 5L8 2H1v11l3-5 2 4 2-2 3 3V5z");

    var svg = document.createElement("svg");
    svg.classList.add("octicon", "octicon-file-media");
    svg.setAttribute("viewBox", "0 0 12 16");
    svg.setAttribute("version", "1.1");
    svg.setAttribute("width", "12");
    svg.setAttribute("height", "16");
    svg.setAttribute("aria-label", "true");

    var button = document.createElement("button");
    button.classList.add("btn-octicon", "tooltipped", "tooltipped-nw");
    button.setAttribute("aria-label", "image list");

    svg.appendChild(path);
    button.appendChild(svg);
    tools.appendChild(button); */

    tools.appendChild(makeDropdown()[0]);

    $('ul.image_dropdown').click(function() {
        if($('ul.image_dropdown_child').is(':hidden')) {
            $("ul:not(:animated)").slideDown(200);
        }
    });
    $('ul.image_dropdown_child').hover(function(){/* in-hover */}, function() {
        // $("ul.image_dropdown_child").slideUp(20);
    });
    /*
    var images = $("<select/>", {
        "class": "form-select select-sm js-code-indent-width",
    });

    $.each(image_list, function(index, img) {
        console.log(img);
        images.append($("<option/>", {
            "value": img,
            "text": img.match(/.+\/(.+?)([\?#;].*)?$/)[1],
        }));
    });

    images.change(function() {
        var url = $(this).val();
        console.log(url);
        navigator.clipboard.writeText("![](" + url + ")");
    });

    images.appendTo(tools); */
}

function makeDropdown() {

    var root = $('<ul/>', {
        'class': 'image_dropdown',
    });

    var wrapper = $('<div/>', { 'class': 'image_list_wrapper'} );
    var list = $('<ul/>', {
        'class': 'image_dropdown_child',
    });
    wrapper.append(list);

    $.each(image_list, function(index, image) {
        var li = $('<li/>');
        var a = $('<a/>', { 'href': '#' });
        a.click(function() {
            let url = $(this).attr('content');
            navigator.clipboard.writeText("![](" + url + ")");

            var arrow = $(this).next('p');
            $(arrow).show(20, function() {
                setTimeout(function() {
                    $(arrow).hide(200);
                }, 300);
            });
        });

        a.attr('content', image);
        a.html(image.match(/.+\/(.+?)([\?#;].*)?$/)[1]);
        li.append(a);
        li.append($('<p/>', { 'class': 'arrow_box' }).html('Copied.'));
        list.append(li);
    });

    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute("d", "M6 5h2v2H6V5zm6-.5V14c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1h7.5L12 4.5zM11 5L8 2H1v11l3-5 2 4 2-2 3 3V5z");

    var svg = document.createElement("svg");
    svg.classList.add("octicon", "octicon-file-media", "image_list_icon");
    svg.setAttribute("viewBox", "0 0 12 16");
    svg.setAttribute("version", "1.1");
    svg.setAttribute("width", "12");
    svg.setAttribute("height", "16");
    svg.setAttribute("aria-label", "true");
    svg.append(path);

    var content = $('<li/>');
    content.append(svg);
    // content.html('V');
    content.append(wrapper);
    root.append(content);

    return root;
}

function getMyURL() {
    var url = location.href;
    var reg = /https:\/\/github\.com\/[^\/]+/;
    return url.match(reg)[0];
}
