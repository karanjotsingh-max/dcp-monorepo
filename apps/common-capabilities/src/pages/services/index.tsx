import React, { useEffect, useState, useMemo } from 'react';
import {
  GoAGrid,
  GoASpacer,
  GoAInput,
  GoAThreeColumnLayout,
  GoACheckbox,
  GoAButton,
  GoAButtonGroup,
  GoADivider,
  GoAAccordion,
  GoACallout,
  GoACircularProgress,
  GoANotification,
} from '@abgov/react-components';
import Card from '../../components/Card';
import './styles.css';
import {
  getAppsFilters,
  generateFilterObject,
  getLastUpdatedDate,
} from '../utils/serviceListUtils';
import {
  defaultSelectedFilters,
  filtersList,
  filterListCustom,
} from '../common/listview/configs';
import useFetch from '../../hooks/useFetch';
import { getApiUrl } from '../../utils/configs';
import {
  Service,
  ServiceAttribute,
  ServiceListingResponse,
  Status,
} from '../../types/types';
import LastUpdated from '../../components/LastUpdated';
import { useAuth } from '../../providers/AuthStateProvider';
import { useNavigate } from 'react-router-dom';
import {
  FilterableField,
  FilterCheckboxState,
  FilterState,
} from '../types/types';

export default function HomePage(): JSX.Element {
  const navigate = useNavigate();
  const [collapseKey, setCollapseKey] = useState(0);
  const [searchFilter, setSearchFilter] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [includeDecommissioned, setIncludeDecommissioned] = useState(() => {
    const persistedValue = localStorage.getItem('includeDecommissioned');
    return persistedValue === 'true';
  });
  const [services, setServices] = useState<Service[]>([]);
  const [filtersAccordionState, setFiltersAccordionState] = useState({
    environment: false,
    language: false,
    keywords: false,
    provider: false,
    status: false,
    functionalGroup: false,
  });
  const listingUrl = useMemo(() => getApiUrl('/listings/services'), []);
  const { authToken } = useAuth();
  const [data, error, isLoading] = useFetch<ServiceListingResponse>(
    listingUrl,
    { headers: { Authorization: `Bearer ${authToken}` } },
  );
  const [apps, setApps] = useState<Service[]>([]);

  // filters state
  const [appFilters, setFilterList] = useState(
    getAppsFilters(services, filtersList),
  );
  const [checkedFilters, setCheckedFilters] = useState<FilterCheckboxState>(
    () => {
      const savedCheckboxState = localStorage.getItem('selectedCheckboxState');
      return savedCheckboxState
        ? JSON.parse(savedCheckboxState)
        : generateFilterObject(apps, filtersList);
    },
  );
  const [selectedFiltersState, setSelectedFiltersState] = useState<FilterState>(
    () => {
      const savedFiltersState = localStorage.getItem('selectedFiltersState');
      return savedFiltersState
        ? JSON.parse(savedFiltersState)
        : defaultSelectedFilters;
    },
  );

  const getHandleFilterChange =
    (filterProperty: FilterableField) => (name: string, checked: boolean) => {
      // handles checkboxes checked state
      setCheckedFilters((prevFilters) => {
        const newCheckboxState = {
          ...prevFilters,
          [filterProperty]: {
            ...prevFilters[filterProperty],
            [name]: checked,
          },
        };
        localStorage.setItem(
          'selectedCheckboxState',
          JSON.stringify(newCheckboxState),
        );
        return newCheckboxState;
      });

      // handles what filters are selected
      setSelectedFiltersState((prevSelectedFiltersState) => {
        // if the filter checked is true, add it to the selectedFiltersState or vice versa
        const newSelectedFiltersState = {
          ...prevSelectedFiltersState,
          [filterProperty]: checked
            ? [...prevSelectedFiltersState[filterProperty], name]
            : prevSelectedFiltersState[filterProperty].filter(
                (filter) => filter !== name,
              ),
        };
        localStorage.setItem(
          'selectedFiltersState',
          JSON.stringify(newSelectedFiltersState),
        );
        return newSelectedFiltersState;
      });

      localStorage.setItem(
        'searchTimestamp',
        (new Date().getTime() + 5 * 60 * 1000).toString(),
      );
    };

  // searches for items in the services array that match the search and filter
  // however search takes priority over filters
  const findServices = (
    array: Service[],
    searchRegExp: RegExp,
    fields: ServiceAttribute[],
    filters: FilterState,
  ) => {
    return array.filter((item: Service) => {
      const fieldMatch = fields
        .map((field) => searchRegExp.test(item[field] as string))
        .some(Boolean);

      const filterMatches = Object.entries(filters).every(
        ([, filterValues]) => {
          if (filterValues.length === 0) {
            return true;
          }

          return filterValues.some((filterValue) =>
            appFilters.indexedItems[filterValue]?.has(item.appId),
          );
        },
      );

      return fieldMatch && filterMatches;
    });
  };

  useEffect(() => {
    if (!isLoading && data) {
      const services = data.services.filter(
        (s) => includeDecommissioned || s.status !== Status.Decommissioned,
      );
      setApps(services);
      setLastUpdated(getLastUpdatedDate(services));
      setFilterList(getAppsFilters(services, filtersList));
    }
  }, [data, isLoading, includeDecommissioned]);

  // to update the services list when the search value or filters change
  useEffect(() => {
    const searchValue = localStorage.getItem('searchFilter') ?? searchFilter;
    const searchRegEx = new RegExp(
      `${searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
      'i',
    );
    setSearchFilter(localStorage.getItem('searchFilter') || '');
    setServices(
      findServices(
        apps,
        searchRegEx,
        [
          'description',
          'summary',
          'serviceName',
          'provider',
          'filterText',
          ...filtersList,
        ],
        selectedFiltersState,
      ),
    );

    let timeoutId: NodeJS.Timeout | null = null;

    if (localStorage.getItem('searchTimestamp')) {
      const searchTimestamp = localStorage.getItem('searchTimestamp');
      const now = new Date().getTime();
      const remainingTime = searchTimestamp
        ? Number(searchTimestamp) - Number(now)
        : 0;

      if (remainingTime <= 0) {
        localStorage.removeItem('searchFilter');
        localStorage.removeItem('searchTimestamp');

        localStorage.removeItem('selectedCheckboxState');
        localStorage.removeItem('selectedFiltersState');
      } else {
        timeoutId = setTimeout(() => {
          localStorage.removeItem('searchFilter');
          localStorage.removeItem('searchTimestamp');

          localStorage.removeItem('selectedCheckboxState');
          localStorage.removeItem('selectedFiltersState');
        }, remainingTime);
      }
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchFilter, selectedFiltersState, apps]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    if (category && apps?.length > 0) {
      localStorage.removeItem('searchFilter');
      localStorage.removeItem('searchTimestamp');

      localStorage.removeItem('selectedCheckboxState');
      localStorage.removeItem('selectedFiltersState');

      // set the state of selectedCheckboxState and selectedFiltersState of category in the functional group
      setSelectedFiltersState({
        ...defaultSelectedFilters,
        functionalGroup: [category, ...defaultSelectedFilters.functionalGroup],
      });
      setCheckedFilters({
        ...generateFilterObject(apps, filtersList),
        functionalGroup: {
          ...generateFilterObject(apps, filtersList).functionalGroup,
          [category]: true,
        },
      });
      setFiltersAccordionState({
        ...filtersAccordionState,
        functionalGroup: true,
      });
    }
  }, [apps]);

  const recommendedServices = services.filter((item) => item.recommended);
  const otherServices = services.filter((item) => !item.recommended);

  let content;

  if (isLoading || (!data && !error)) {
    content = (
      <GoACircularProgress
        variant="fullscreen"
        size="large"
        message="Loading service list..."
        visible={true}
      />
    );
  } else if (error) {
    content = (
      <GoANotification type="emergency" ariaLive="assertive">
        Failed to load service details. Please try again later. <br /> Error:{' '}
        {error.message}
      </GoANotification>
    );
  } else {
    content = (
      <GoAThreeColumnLayout
        leftColumnWidth="23%"
        maxContentWidth="1550px"
        nav={
          <div className="home-sidebar">
            <div id="search-label"> Search</div>
            <GoAInput
              placeholder="Search"
              width="100%"
              name="search"
              leadingIcon="search"
              value={searchFilter}
              onChange={(_: string, value: string) => {
                setSearchFilter(value);
                //reset filters and checkbox state
                localStorage.removeItem('selectedCheckboxState');
                localStorage.removeItem('selectedFiltersState');
                setCheckedFilters(generateFilterObject(apps, filtersList));
                setSelectedFiltersState(defaultSelectedFilters);
                localStorage.setItem(
                  'searchTimestamp',
                  (new Date().getTime() + 5 * 60 * 1000).toString(),
                );
                localStorage.setItem('searchFilter', value);
              }}
            />
            <GoASpacer vSpacing="l" />
            <GoAButtonGroup alignment="start" gap="compact">
              <GoAButton
                type="primary"
                size="compact"
                onClick={() => {
                  localStorage.removeItem('searchFilter');
                  localStorage.removeItem('searchTimestamp');
                  localStorage.removeItem('selectedCheckboxState');
                  localStorage.removeItem('selectedFiltersState');

                  setSearchFilter('');
                  setCheckedFilters(generateFilterObject(apps, filtersList));
                  setSelectedFiltersState(defaultSelectedFilters);
                }}
              >
                Clear all
              </GoAButton>

              <GoAButton
                size="compact"
                type="secondary"
                onClick={() => {
                  setFiltersAccordionState({
                    environment: false,
                    language: false,
                    keywords: false,
                    provider: false,
                    status: false,
                    functionalGroup: false,
                  });
                  setCollapseKey((prevKey) => prevKey + 1); //
                }}
              >
                Collapse all
              </GoAButton>

              <GoAButton
                size="compact"
                type="secondary"
                onClick={() => {
                  setFiltersAccordionState({
                    environment: true,
                    language: true,
                    keywords: true,
                    provider: true,
                    status: true,
                    functionalGroup: true,
                  });
                }}
              >
                Expand all
              </GoAButton>
            </GoAButtonGroup>
            <GoASpacer vSpacing="l" />
            <GoACheckbox
              key={'includeDecommissioned'}
              name={'includeDecommissioned'}
              text={'Include Decommissioned services'}
              checked={includeDecommissioned}
              onChange={(_, checked) => {
                setIncludeDecommissioned(checked);
                localStorage.setItem(
                  'includeDecommissioned',
                  checked.toString(),
                );
                if (!checked) {
                  getHandleFilterChange('status')(Status.Decommissioned, false);
                }
              }}
            />
            <GoADivider></GoADivider>
            <GoASpacer vSpacing="xl" />
            {filterListCustom.map((filterCategory) => (
              <div key={filterCategory.property}>
                <GoAAccordion
                  key={`${filterCategory.title} ${collapseKey}`}
                  heading={`${filterCategory.title} (${
                    selectedFiltersState[filterCategory.property].length
                  })`}
                  headingSize="small"
                  open={filtersAccordionState[filterCategory.property]}
                >
                  {appFilters.filters[filterCategory.property]?.map(
                    (filter) => (
                      <GoACheckbox
                        key={filter}
                        name={filter}
                        text={`${filter}`}
                        checked={
                          checkedFilters[filterCategory.property]?.[filter]
                        }
                        onChange={getHandleFilterChange(
                          filterCategory.property,
                        )}
                      />
                    ),
                  )}{' '}
                </GoAAccordion>
                <GoASpacer vSpacing="m" />
              </div>
            ))}
          </div>
        }
      >
        <div className="home-header">
          <h1 id="home-title">Services</h1>
          <GoAButton type="secondary" onClick={() => navigate('/addservice')}>
            <b>Add a new service</b>
          </GoAButton>
        </div>
        {/* <span className="last-updated">Last updated: {formattedDate}</span>   <br /> */}
        <span className="last-updated">
          Showing {recommendedServices.length + otherServices.length} of{' '}
          {apps.length} results{' '}
        </span>
        <GoASpacer vSpacing="s" />
        <h2>Recommended services listing</h2>
        Recommended services are standard components built for the product teams
        to reuse. We highly recommend leveraging these standard services with
        the &quot;Recommended&quot; tag to streamline your development process,
        maximize efficiency, and optimize costs.
        <GoASpacer vSpacing="xl" />
        <GoAGrid minChildWidth="35ch" gap="2xl">
          {recommendedServices.length > 0 ? (
            recommendedServices.map((app) => {
              return <Card key={app.appId} app={app} />;
            })
          ) : (
            <GoACallout
              type="information"
              size="medium"
              heading="No recommended services found based on your search / filter options"
            ></GoACallout>
          )}
        </GoAGrid>
        <GoASpacer vSpacing="l" />
        <h2>Other services</h2>
        Other services include services built to serve specific use cases and
        might not be suitable to be used by the product teams. We still
        encourage you to the reach out to the service providers to collaborate
        or share knowledge and best practices if you are building something
        similar.
        <GoASpacer vSpacing="xl" />
        <GoAGrid minChildWidth="35ch" gap="2xl">
          {otherServices.length > 0 ? (
            otherServices.map((app) => {
              return <Card key={app.appId} app={app} />;
            })
          ) : (
            <GoACallout
              type="information"
              size="medium"
              heading="No other services found based on your search / filter options"
            ></GoACallout>
          )}
        </GoAGrid>
        <GoASpacer vSpacing="3xl" />
        <LastUpdated date={lastUpdated} />
      </GoAThreeColumnLayout>
    );
  }

  return content;
}
