module.exports = function libraryCatalog(context) {
  return {
    name: 'library-catalog',
    getPathsToWatch() {
      return [context.siteDir + '/library/**/*.{md,mdx,cradle,png,jpg,jpeg,webp,gif,svg}'];
    },
    async loadContent() {
      const {generateLibrary} = await import('../../scripts/generate-library.mjs');
      return generateLibrary(context.siteDir);
    },
  };
};
