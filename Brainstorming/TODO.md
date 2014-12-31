AI Kingdoms - TODO
------------------

This is a list of things that can be done right now, not of long term goals.

## Time-Flow
- [ ] Money Flow
- [ ] Gradual Character Aging

## Character
- [x] Attributes
- [x] Static Skills
- [x] Dynamic Skills that only affect the character in certain situations~~
- [ ] Traits that affect the character like Skills do
 + Icons depending on category of trait? Since we do not have trait levels. 
- [ ] Level up requirements for Skills, to make the skill distribution a bit more coherent.
- [ ] Character Gen: Distribute Traits by Tags, like the Skills.
- [ ] [Idea] Focus? How much the character is currently improving, affected by how active and how sucessful he is. To simulate up and downs in a career.

## Interface
- [ ] Portraits
- [ ] New layout to accomodate tshe portraits
- [ ] Display of Action Point resource
- [ ] Display of current Time and time controls
- [ ] UI for army display
- [ ] UI for battle display

## Armies & Battles
- [ ] Aim for a Minimal Valuable Product at first
- [ ] Army size
 + Cities need a Size attribute to determine the army sizes.
- [ ] The General
- [ ] Other Characters that take part in the battles
- [ ] Battles
 + Morale as a percentage
 + Simulate the ongoing battle in Steps
 + A step is a clash between of two or more parts of each army
 + Each step has a outcome which affects the morale
 + Outcome is determined by the characters on the battlefield
 + Characters can die during any step in which case they have no further effect

## Actions
- [ ] Can be performed by the player for action points.
- [ ] The outcome of a action should be mostly deterministc.
- [ ] Needs more thought: What actions?

## Technical
- [ ] Savegames
 + We need a Serialization engine for this. [cycle.js](https://github.com/douglascrockford/JSON-js/blob/master/cycle.jss) is the closest to what we need, but we need a more configurable and full featured version due to constructors and references to data that shouldn't be copied.
 + AI-Kingdoms uses references like bread and butter. References don't work with pure JSON.
 + Also AI-Kingdoms uses Javascript Classes, also not supported by JSON.
 + And lastly, cycle.js is slow with large data sets. We need it to be faster. Hashmap?
