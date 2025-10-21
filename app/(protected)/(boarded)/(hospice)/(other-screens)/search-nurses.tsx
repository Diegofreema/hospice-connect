import { SearchNurses } from '@/features/hospice/components/search-nurses';
import { BackButton } from '@/features/shared/components/back-button';
import { SearchComponent } from '@/features/shared/components/search-component';
import { Wrapper } from '@/features/shared/components/wrapper';
import React, { useState } from 'react';
import { useDebounce } from 'use-debounce';

const SearchNursesScreen = () => {
  const [value, setValue] = useState('');
  const [query] = useDebounce(value, 500);
  return (
    <Wrapper>
      <BackButton title="Search" marginTop={0} />
      <SearchComponent
        placeholder="Search"
        value={value}
        onChangeText={setValue}
        setValue={setValue}
      />
      <SearchNurses query={query} />
    </Wrapper>
  );
};

export default SearchNursesScreen;
