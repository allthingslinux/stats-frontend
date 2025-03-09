# frontend for stats.atl.dev

some things are hard coded please fork if you want to self host

## **High Priority**

- [x] FIX MOBILE
- [x] Search bar
- [x] Zoom buttons
- [x] Move search bar to left
- [x] Put the dropdown button on the right corner and make it bigger
- [x] Dark mode
- [x] Color by weight and thickness by weight
- [x] About dropdown under search bar
- [x] click on user to see other users and each edges weight and the users weighted degree

## **Low Priority**

- [ ] Possibly be able to drag layout around
- [ ] Change rendering options (E.G. label threshold)
- [ ] Fix misaligned info box on small screens
- [X] Make info box fully white on light mode

## Build

Build with `./build.sh` for docker build.

Regular dev instructions:

```
cp .env.example .env
$EDITOR .env
yarn install
yarn dev
```
