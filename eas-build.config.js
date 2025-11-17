module.exports = {
    build: async({ env, steps }) =>{
        await steps.run("bump version",{
            command : "node scripts/bumpVersion.js"
        });
    }
};