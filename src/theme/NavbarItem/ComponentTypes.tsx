import type {ComponentType} from 'react';
import OriginalComponentTypes from '@theme-original/NavbarItem/ComponentTypes';

import CustomVersionDropdownNavbarItem from './CustomVersionDropdownNavbarItem';

const ComponentTypes: Record<string, ComponentType<any>> = {
  ...OriginalComponentTypes,

  'custom-version-dropdown':
    CustomVersionDropdownNavbarItem,
};

export default ComponentTypes;