let map = null
let popups = []
let markers = []
$(document).ready(() => {
    mapboxgl.accessToken = token;
    map = new mapboxgl.Map({
        container: "map", // container ID
        // center: [-122.420679, 37.772537], // starting position [lng, lat]
        center: [113.685, -7.2438],
        zoom: 9, // starting zoom
        style: "mapbox://styles/mapbox/streets-v11", // style URL or style object
        hash: true, // sync `center`, `zoom`, `pitch`, and `bearing` with URL
        // Use `transformRequest` to modify requests that begin with `http://myHost`.
        transformRequest: (url, resourceType) => {
            if (resourceType === "Source" && url.startsWith("http://myHost")) {
                return {
                    url: url.replace("http", "https"),
                    headers: { "my-custom-header": true },
                    credentials: "include", // Include cookies for cross-origin requests
                }
            }
        },
    })

    // add control zoom
    const nav = new mapboxgl.NavigationControl({
        visualizePitch: true
    })

    map.addControl(nav, 'bottom-right')

    // get_restaurants();
    drawInitials();
})

function get_restaurants() {
    $("#restaurant-box").empty();
    $.ajax({
        type: "GET",
        url: "/restaurants",
        data: {},
        success: function (response) {
            const restaurants = response["restaurants"];
            restaurants.forEach((restaurant, i) => {
                make_card(i, restaurant);
                make_marker(restaurant.coordinates);
                add_info(i, restaurant);
            });
        },
    });
}

function drawInitials() {
    let initials = [
        // A
        [113.6445, -7.2632],
        [113.6580, -7.2301],
        [113.6680, -7.2000],
        [113.6780, -7.1700],
        [113.6980, -7.1400],
        [113.7180, -7.1700],
        [113.7280, -7.2000],
        [113.7380, -7.2301],
        [113.7480, -7.2632],
        [113.7080, -7.2301],
        [113.6880, -7.2301],
        // R
        [113.8480, -7.2632],
        [113.8480, -7.2332],
        [113.8480, -7.2032],
        [113.8480, -7.1732],
        [113.8480, -7.1432],
        [113.8780, -7.1432],
        [113.9080, -7.1532],
        [113.9380, -7.1732],
        [113.9280, -7.2000],
        [113.8980, -7.2100],
        [113.8700, -7.2200],
        [113.8880, -7.2450],
        [113.9080, -7.2650],
    ];

    initials.forEach(i => {
        make_marker(i);
    });
}

// in restaurant object, i use 'coordinates' instead of 'center' attribute
function make_card(i, restaurant) {
    let html_temp =
        `<div class="card" id="card-${i}" onClick="map.flyTo({center: [${restaurant.coordinates}]})">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="card-title"><a href="#" class="restaurant-title">${restaurant.name}</a></h5>
                            <h6 class="card-subtitle mb-2 text-muted">${restaurant.categories}</h6>
                            <p class="card-text">${restaurant.location}</p>
                        </div>
                        <div>
                            <button class="btn btn-danger" onclick="del_restaurant('${restaurant.name}')">
                                <i class="bi bi-trash3"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
    $("#restaurant-box").append(html_temp);
}

function make_marker(coordinates) {
    new mapboxgl.Marker().setLngLat(coordinates).addTo(map);
}

function add_info(i, restaurant) {
    new mapboxgl.Popup({
        offset: {
            bottom: [0, -35],
        },
    })
        .setLngLat(restaurant.coordinates)
        .setHTML(
            `<div class="iw-inner" onclick="map.flyTo({center: [${restaurant.coordinates}]}); scroll_to_card(${i})">
                        <h5>${restaurant.name}</h5>
                        <p>${restaurant.location}</p>
                    </div>`
        )
        .setMaxWidth("300px")
        .addTo(map);
}

function scroll_to_card(i) {
    $("#restaurant-box").animate(
        {
            scrollTop:
                $("#restaurant-box").get(0).scrollTop +
                $(`#card-${i}`).position().top,
        },
        1000
    );
}

function add_restaurant() {
    const data = {
        name: $('#name').val(),
        categories: $('#category').val(),
        location: $('#location').val(),
        coordinates: [
            $('#long').val(),
            $('#lat').val(),
        ],
    };
    $.ajax({
        type: "POST",
        url: "/restaurants",
        data: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        },
        success: function (response) {
            get_restaurants()
            const temp_html =
                `<div class="position-fixed z-2 end-0 start-0 alert alert-success alert-dismissible fade show rounded-0" role="alert">
                            ${response.msg}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`;
            $('.wrap').prepend(temp_html);
        },
    });
}

function del_restaurant(name) {
    $.ajax({
        type: "DELETE",
        url: "/restaurants",
        data: {
            name: name
        },
        success: function (response) {
            get_restaurants()
            const temp_html =
                `<div class="position-fixed z-2 end-0 start-0 alert alert-success alert-dismissible fade show rounded-0" role="alert">
                            ${response.msg}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`;
            $('.wrap').prepend(temp_html);
        },
    });
}
