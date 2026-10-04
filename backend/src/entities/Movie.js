const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Movie",
    tableName: "movies",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        title: {
            type: "nvarchar",
            length: 255,
        },
        genre: {
            type: "nvarchar",
            length: 100,
        },
        releaseDate: {
            type: "nvarchar",
            length: 50,
            nullable: true,
        },
        description: {
            type: "nvarchar",
            length: "MAX",
            nullable: true,
        },
        image: {
            type: "nvarchar",
            length: 500,
            nullable: true,
        },
        videoUrl: {
            type: "nvarchar",
            length: 500,
            nullable: true,
        },
        subtitleUrl: {
            type: "nvarchar",
            length: 500,
            nullable: true,
        },
        views: {
            type: "int",
            default: 0,
        },
    },
});
