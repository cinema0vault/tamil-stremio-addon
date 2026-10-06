const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const manifest = {
    id: "com.tamilvault.addon",
    version: "1.0.0",
    name: "Tamil Vault",
    description: "Tamil movie catalog for Stremio",

    resources: [
        "catalog",
        "meta",
        "stream"
    ],

    types: [
        "movie"
    ],

    catalogs: [
        {
            type: "movie",
            id: "tamil_movies",
            name: "Tamil Movies",

            extra: [
                {
                    name: "search",
                    isRequired: false
                }
            ]
        }
    ]
};

const builder = new addonBuilder(manifest);


// TEST MOVIES

const movies = [
    {
        id: "tamil-test-001",
        name: "Tamil Test Movie",
        year: 2026,

        poster: "https://placehold.co/600x900",

        description:
            "Test Tamil movie for our Stremio addon.",

        genre: [
            "Tamil",
            "Drama"
        ],

        stream: null
    },

    {
        id: "tamil-test-002",
        name: "Tamil Action Test",
        year: 2026,

        poster: "https://placehold.co/600x900",

        description:
            "Test Tamil action movie.",

        genre: [
            "Tamil",
            "Action"
        ],

        stream: null
    }
];


// CATALOG

builder.defineCatalogHandler(async (args) => {

    let results = movies;

    if (args.extra && args.extra.search) {

        const search = args.extra.search
            .toLowerCase()
            .trim();

        results = movies.filter(movie =>
            movie.name
                .toLowerCase()
                .includes(search)
        );
    }

    return {
        metas: results.map(movie => ({
            id: movie.id,
            type: "movie",
            name: movie.name,
            poster: movie.poster,
            releaseInfo: String(movie.year),
            description: movie.description,
            genres: movie.genre
        }))
    };
});


// MOVIE DETAILS

builder.defineMetaHandler(async (args) => {

    const movie = movies.find(
        movie => movie.id === args.id
    );

    if (!movie) {
        return {
            meta: null
        };
    }

    return {
        meta: {
            id: movie.id,
            type: "movie",
            name: movie.name,
            poster: movie.poster,
            description: movie.description,
            releaseInfo: String(movie.year),
            genres: movie.genre
        }
    };
});


// STREAM

builder.defineStreamHandler(async (args) => {

    const movie = movies.find(
        movie => movie.id === args.id
    );

    if (!movie || !movie.stream) {
        return {
            streams: []
        };
    }

    return {
        streams: [
            {
                name: "Tamil Vault",
                title: movie.name,
                url: movie.stream
            }
        ]
    };
});


// START SERVER

const PORT = process.env.PORT || 7000;

serveHTTP(
    builder.getInterface(),
    {
        port: PORT
    }
);

console.log("");
console.log("==============================");
console.log("      TAMIL VAULT ADDON");
console.log("==============================");
console.log("");
console.log(`Server running on port ${PORT}`);
console.log("");