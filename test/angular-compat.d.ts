/**
 * Module augmentation that adds `standalone` to the `@Component` / `@Directive` / `@Pipe`
 * decorator-options interface for Angular versions < 14, which predate the standalone API.
 *
 * Angular 19+ treats every component without an explicit `standalone: false` as standalone
 * by default, so test components must opt out. The augmentation here ensures that passing
 * `standalone: false` does not cause a TypeScript "excess property" error when the project
 * is tested against older Angular where the property did not yet exist in the type.
 */
declare module '@angular/core' {
  interface Component {
    standalone?: boolean;
  }
  interface Directive {
    standalone?: boolean;
  }
  interface Pipe {
    standalone?: boolean;
  }
}
