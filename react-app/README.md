# SANGRIA React Lab

Esta carpeta agrega una base en React para que el repo tambien muestre:

- componentes funcionales
- props
- `useState`
- `useEffect`
- `useDeferredValue`
- formularios controlados
- `localStorage`
- `fetch` con `async/await`

## Correr la app

En Windows PowerShell, si `npm` te da problema por la politica de scripts, usa:

```powershell
npm.cmd install
npm.cmd run dev
```

## Estructura

- `src/App.jsx`: estado principal, filtros, carrito y checkout
- `src/components/*`: componentes funcionales
- `src/data/*`: productos y conceptos incorporados
- `src/hooks/useLocalStorage.js`: persistencia
- `src/lib/currency.js`: fetch de cotizacion y formateo

## Siguiente paso

La migracion a Next.js puede hacerse sobre esta base, moviendo el catalogo a rutas con App Router.
