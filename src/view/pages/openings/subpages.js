
import Factory  from '../../components/factory';
import view     from './view';

const Openings   = Factory.create('Openings',   { view });
const Volumes    = Factory.create('Volumes',    { view });
const Groups     = Factory.create('Groups',     { view });
const Chapters   = Factory.create('Chapters',   { view });
const Variations = Factory.create('Variations', { view });

export {
    Openings,
    Volumes,
    Groups,
    Chapters,
    Variations,
};
