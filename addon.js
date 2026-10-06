const fs = require("fs");
const path = require("path");
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


// =====================================================
// LOAD ALL JSON FILES FROM THE MOVIES FOLDER
// =====================================================

function loadMovies() {

    const moviesFolder = path.join(__dirname, "movies");

    if (!fs.existsSync(moviesFolder)) {
        return [];
    }

    const files = fs.readdirSync(moviesFolder)
        .filter(file => file.toLowerCase().endsWith(".json"));

    let allMovies = [];

    for (const file of files) {

        try {

            const filePath = path.join(moviesFolder, file);

            const data = JSON.parse(
                fs.readFileSync(filePath, "utf8")
            );

            if (Array.isArray(data)) {
                allMovies = allMovies.concat(data);
            }

        } catch (error) {

            console.error(
                "Error loading " + file + ":",
                error.message
            );
        }
    }

    return allMovies;
}


// =====================================================
// CATALOG
// =====================================================

builder.defineCatalogHandler(async (args) => {

    const movies = loadMovies();

    let results = movies;

    if (args.extra && args.extra.search) {

        const search = args.extra.search
            .toLowerCase()
            .trim();

        results = movies.filter(movie =>
            movie.name &&
            movie.name.toLowerCase().includes(search)
        );
    }

    return {
        metas: results.map(movie => ({
            id: movie.id,
            type: "movie",
            name: movie.name,
            poster: movie.poster,
            releaseInfo: String(movie.year),
            description: movie.name + " (" + movie.year + ")",
            genres: ["Tamil"]
        }))
    };
});


// =====================================================
// MOVIE DETAILS
// =====================================================

builder.defineMetaHandler(async (args) => {

    const movies = loadMovies();

    const movie = movies.find(movie =>
        movie.id === args.id
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
            description: movie.name + " (" + movie.year + ")",
            releaseInfo: String(movie.year),
            genres: ["Tamil"]
        }
    };
});


// =====================================================
// STREAM
// =====================================================

builder.defineStreamHandler(async (args) => {

    const movies = loadMovies();

    const movie = movies.find(movie =>
        movie.id === args.id
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


// =====================================================
// START SERVER
// =====================================================

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
console.log("Server running on port " + PORT);
console.log("Movies loaded: " + loadMovies().length);
console.log("");