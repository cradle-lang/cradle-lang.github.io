declare module '*.cradle' {
  const url: string;
  export default url;
}

declare module '*.cradle?raw' {
  const source: string;
  export default source;
}
