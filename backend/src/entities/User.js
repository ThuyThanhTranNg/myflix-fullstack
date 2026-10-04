const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "User",
    tableName: "users",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        firstName: {
            type: "nvarchar",
            length: 100,
            nullable: true,
        },
        lastName: {
            type: "nvarchar",
            length: 100,
            nullable: true,
        },
        username: {
            type: "nvarchar",
            length: 100,
            unique: true,
        },
        email: {
            type: "nvarchar",
            length: 255,
            unique: true,
        },
        password: {
            type: "nvarchar",
            length: 255,
        },
        gender: {
            type: "nvarchar",
            length: 20,
            nullable: true,
        },
        isAdmin: {
            type: "bit",
            default: 0,
        }
    },
});
