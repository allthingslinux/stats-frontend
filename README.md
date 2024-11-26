# frontend for stats.atl.dev

## **High Priority**

- [x] FIX MOBILE
- [x] Search bar
- [x] Zoom buttons
- [ ] Move search bar to left
- [ ] Put the dropdown button on the right corner and make it bigger
- [ ] Dark mode
- [x] Color by weight and thickness by weight
- [x] About dropdown under search bar
- [ ] click on user to see other users and each edges weight and the users weighted degree

## **Low Priority**

- [ ] Possibly be able to drag layout around
- [ ] Change rendering options (E.G. label threshold)

Build with `./build.sh` for docker build.

Regular dev instructions:

```
cp .env.example .env
$EDITOR .env
yarn install
yarn dev
```
