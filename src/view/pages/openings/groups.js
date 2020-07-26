
import Factory  from '../../components/factory';
import view     from './view';

const Volumes    = Factory.create('Volumes',    { view });
const Groups     = Factory.create('Groups',     { view });
const Chapter    = Factory.create('Chapters',   { view });
const Variations = Factory.create('Variations', { view });

export default {
    Volumes,
    Groups,
    Chapter,
    Variations,
};
