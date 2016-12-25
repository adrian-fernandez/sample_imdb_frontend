var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

import Ember from 'ember';
import fmt from '../utils/fmt';

import layout from '../templates/components/models-table';
import ModelsTableColumn from '../-private/column';

/**
 * @typedef {object} groupedHeader
 * @property {string} title header for grouped columns
 * @property {number} colspan HTML colspan attr
 * @property {number} rowspan HTML rowspan attr
 */

var keys = Object.keys;
var get = Ember.get;
var set = Ember.set;
var getWithDefault = Ember.getWithDefault;
var setProperties = Ember.setProperties;
var getProperties = Ember.getProperties;
var computed = Ember.computed;
var observer = Ember.observer;
var isNone = Ember.isNone;
var A = Ember.A;
var on = Ember.on;
var compare = Ember.compare;
var typeOf = Ember.typeOf;
var run = Ember.run;
var Component = Ember.Component;
var assert = Ember.assert;
var assign = Ember.assign;
var S = Ember.String;
var O = Ember.Object;
var jQ = Ember.$;

var NOT_SORTED = -1;

var defaultMessages = {
  searchLabel: 'Search:',
  searchPlaceholder: '',
  'columns-title': 'Columns',
  'columns-showAll': 'Show All',
  'columns-hideAll': 'Hide All',
  'columns-restoreDefaults': 'Restore Defaults',
  tableSummary: 'Show %@ - %@ of %@',
  allColumnsAreHidden: 'All columns are hidden. Use <strong>columns</strong>-dropdown to show some of them',
  noDataToShow: 'No records to show'
};

var defaultIcons = {
  'sort-asc': 'glyphicon glyphicon-triangle-bottom',
  'sort-desc': 'glyphicon glyphicon-triangle-top',
  'column-visible': 'glyphicon glyphicon-check',
  'column-hidden': 'glyphicon glyphicon-unchecked',
  'nav-first': 'glyphicon glyphicon-chevron-left',
  'nav-prev': 'glyphicon glyphicon-menu-left',
  'nav-next': 'glyphicon glyphicon-menu-right',
  'nav-last': 'glyphicon glyphicon-chevron-right',
  'caret': 'caret',
  'expand-row': 'glyphicon glyphicon-plus',
  'collapse-row': 'glyphicon glyphicon-minus'
};

var defaultCssClasses = {
  outerTableWrapper: '',
  innerTableWrapper: 'inner-table-wrapper',
  table: 'table table-striped table-bordered table-condensed',
  globalFilterWrapper: 'pull-left',
  columnsDropdownWrapper: 'pull-right columns-dropdown',
  columnsDropdownButtonWrapper: 'btn-group',
  columnsDropdown: 'dropdown-menu pull-right',
  theadCell: 'table-header',
  theadCellNoSorting: 'table-header-no-sorting',
  theadCellNoFiltering: 'table-header-no-filtering',
  tfooterWrapper: 'table-footer clearfix',
  footerSummary: 'table-summary',
  footerSummaryNumericPagination: 'col-md-4 col-sm-4 col-xs-4',
  footerSummaryDefaultPagination: 'col-md-5 col-sm-5 col-xs-5',
  pageSizeWrapper: 'col-md-2 col-sm-2 col-xs-2',
  pageSizeSelectWrapper: 'pull-right',
  paginationWrapper: 'table-nav',
  paginationWrapperNumeric: 'col-md-6 col-sm-6 col-xs-6',
  paginationWrapperDefault: 'col-md-5 col-sm-5 col-xs-5',
  buttonDefault: 'btn btn-default',
  noDataCell: '',
  collapseRow: 'collapse-row',
  expandRow: 'expand-row',
  thead: '',
  input: 'form-control',
  clearFilterIcon: 'glyphicon glyphicon-remove-sign form-control-feedback',
  clearAllFiltersIcon: 'glyphicon glyphicon-remove-circle'
};

function isSortedByDefault(column) {
  return column.sortPrecedence > NOT_SORTED;
}

/**
 * Default filter-function used in the filter by columns
 *
 * @param {string} cellValue value in the table cell
 * @param {string} filterString needed substring
 * @returns {boolean}
 */
function defaultFilter(cellValue, filterString) {
  return -1 !== cellValue.indexOf(filterString);
}

/**
 * Convert some string to the human readable one
 *
 * @param {string} name value to convert
 * @return {string}
 */
function propertyNameToTitle(name) {
  return S.capitalize(S.dasherize(name).replace(/\-/g, ' '));
}

/**
 * Updates <code>filterOptions</code> for column which use <code>filterWithSelect</code>
 * and don't have <code>predefinedFilterOptions</code>
 * <code>filterOptions</code> are calculated like <code>data.mapBy(column.propertyName).uniq()</code>,
 * where data is component's <code>data</code>
 */
function getFilterOptionsCP(propertyName) {
  return computed('data.@each.' + propertyName, function () {
    var data = get(this, 'data');
    var predefinedFilterOptions = get(this, 'predefinedFilterOptions');
    var filterWithSelect = get(this, 'filterWithSelect');
    if (filterWithSelect && 'array' !== typeOf(predefinedFilterOptions)) {
      var options = A(data.mapBy(propertyName)).compact();
      if (get(this, 'sortFilterOptions')) {
        options = options.sort();
      }
      return A([''].concat(options)).uniq();
    }
    return [];
  });
}

/**
 * data -> filteredContent -> arrangedContent -> visibleContent
 *
 * @class ModelsTable
 * @extends Ember.Component
 */
export default Component.extend({

  layout: layout,

  /**
   * Number of records shown on one table-page (size of the <code>visibleContent</code>)
   *
   * @type number
   * @name ModelsTable#pageSize
   * @default 10
   */
  pageSize: 10,

  /**
   * @type {number}
   * @name ModelsTable#currentPageNumber
   * @default 1
   */
  currentPageNumber: 1,

  /**
   * @type {string[]}
   * @name ModelsTable#sortProperties
   * @default []
   */
  sortProperties: A([]),

  /**
   * Determines if multi-columns sorting should be used
   *
   * @type {boolean}
   * @name ModelsTable#multipleColumnsSorting
   * @default false
   */
  multipleColumnsSorting: true,

  /**
   * Determines if component footer should be shown on the page
   *
   * @type {boolean}
   * @name ModelsTable#showComponentFooter
   * @default true
   */
  showComponentFooter: true,

  /**
   * Determines if numeric pagination should be used
   *
   * @type {boolean}
   * @name ModelsTable#useNumericPagination
   * @default false
   */
  useNumericPagination: false,

  /**
   * Determines if columns-dropdown should be shown
   *
   * @type {boolean}
   * @name ModelsTable#showColumnsDropdown
   * @default true
   */
  showColumnsDropdown: true,

  /**
   * Determines if filtering by columns should be available to the user
   *
   * @type {boolean}
   * @name ModelsTable#useFilteringByColumns
   * @default true
   */
  useFilteringByColumns: true,

  /**
   * @type {string}
   * @name ModelsTable#filterString
   * @default ''
   */
  filterString: '',

  /**
   * Determines if filtering (global and by column) should ignore case
   *
   * @type {boolean}
   * @name ModelsTable#filteringIgnoreCase
   * @default false
   */
  filteringIgnoreCase: false,

  /**
   * Determines if filtering should be done by hidden columns
   * Notice: after changing this value filtering results will be updated only after filter options are changed
   *
   * @type {boolean}
   * @name ModelsTable#doFilteringByHiddenColumns
   * @default true
   */
  doFilteringByHiddenColumns: true,

  /**
   * Determines if "Global filter"-field should be shown
   *
   * @type {boolean}
   * @name ModelsTable#showGlobalFilter
   * @default true
   */
  showGlobalFilter: true,

  /**
   * Determines if focus should be on the "Global filter"-field on component render
   *
   * @type {boolean}
   * @name ModelsTable#focusGlobalFilter
   * @default false
   */
  focusGlobalFilter: false,

  /**
   * Determines if <code>processedColumns</code> will be updated if <code>columns</code> are changed (<code>propertyName</code> and
   * <code>template</code> are observed)
   * <b>IMPORTANT</b> All filter, sort and visibility options will be dropped to the default values while updating
   *
   * @type {boolean}
   * @name ModelsTable#columnsAreUpdateable
   * @default false
   */
  columnsAreUpdateable: false,

  /**
   * <code>columns</code> fields which are observed to update shown table-columns
   * It is used only if <code>columnsAreUpdateable</code> is <code>true</code>
   *
   * @type {string[]}
   * @name ModelsTable#columnFieldsToCheckUpdate
   * @default ['propertyName', 'template']
   */
  columnFieldsToCheckUpdate: A(['propertyName', 'template']),

  /**
   * All table records
   *
   * @type {Ember.Object[]}
   * @name ModelsTable#data
   * @default []
   */
  data: A([]),

  /**
   * Table columns
   *
   * @type {ModelsTable~ModelsTableColumn[]}
   * @name ModelsTable#columns
   * @default []
   */
  columns: A([]),

  /**
   * @type {Ember.Object[]}
   * @name ModelsTable#processedColumns
   * @default []
   */
  processedColumns: A([]),

  /**
   * @type {Object}
   * @name ModelsTable#messages
   */
  messages: O.create({}),

  /**
   * @type {Object}
   * @name ModelsTable#classes
   */
  classes: O.create({}),

  /**
   * @type {Object}
   * @name ModelsTable#icons
   */
  icons: O.create({}),

  /**
   * List of the additional headers
   * Used to group columns
   *
   * @type {groupedHeader[][]}
   * @name ModelsTable#groupedHeaders
   */
  groupedHeaders: A([]),

  /**
   * Template with First|Prev|Next|Last buttons
   *
   * @type {string}
   * @name ModelsTable#simplePaginationTemplate
   * @default 'components/models-table/simple-pagination'
   */
  simplePaginationTemplate: 'components/models-table/simple-pagination',

  /**
   * Template with nav buttons
   *
   * @type {string}
   * @name ModelsTable#numericPaginationTemplate
   * @default 'components/models-table/numeric-pagination'
   */
  numericPaginationTemplate: 'components/models-table/numeric-pagination',

  /**
   * Template with table footer
   *
   * @type {string}
   * @name ModelsTable#tableFooterTemplate
   * @default 'components/models-table/table-footer'
   */
  tableFooterTemplate: 'components/models-table/table-footer',

  /**
   * Template for component footer
   *
   * @type {string}
   * @name ModelsTable#tfooterTemplate
   * @default
   */
  componentFooterTemplate: 'components/models-table/component-footer',

  /**
   * Template for page size
   *
   * @type {string}
   * @name ModelsTable#pageSizeTemplate
   * @default 'components/models-table/table-footer'
   */
  pageSizeTemplate: 'components/models-table/page-size',

  /**
   * Determines if page size should be shown
   *
   * @type {boolean}
   * @name ModelsTable#showPageSize
   * @default true
   */
  showPageSize: true,

  /**
   * Template with global filter
   *
   * @type {string}
   * @name ModelsTable#globalFilterTemplate
   * @default 'components/models-table/global-filter'
   */
  globalFilterTemplate: 'components/models-table/global-filter',

  /**
   * Template with columns dropdown
   *
   * @type {string}
   * @name ModelsTable#columnsDropdownTemplate
   * @default 'components/models-table/columns-dropdown'
   */
  columnsDropdownTemplate: 'components/models-table/columns-dropdown',

  /**
   * Template with header row for column names
   *
   * @type {string}
   * @name ModelsTable#headerRowSortingTemplate
   * @default 'components/models-table/header-row-sorting'
   */
  headerSortingRowTemplate: 'components/models-table/header-row-sorting',

  /**
   * Template for sorting icons
   *
   * @type {string}
   * @name ModelsTable#headerSortingIconsTemplate
   * @default 'components/models-table/header-sorting-icons'
   */
  headerSortingIconsTemplate: 'components/models-table/header-sorting-icons',

  /**
   * Template with header row for column filters
   *
   * @type {string}
   * @name ModelsTable#headerFilteringRowTemplate
   * @default 'components/models-table/header-row-filtering'
   */
  headerFilteringRowTemplate: 'components/models-table/header-row-filtering',

  /**
   * Template with header rows for columns grouping
   *
   * @type {string}
   * @name ModelsTable#headerFilteringRowTemplate
   * @default 'components/models-table/header-rows-grouped'
   */
  headerGroupedRowsTemplate: 'components/models-table/header-rows-grouped',

  /**
   * Template for table's row
   *
   * @type {string}
   * @default 'components/models-table/row'
   * @name ModelsTable#rowTemplate
   */
  rowTemplate: 'components/models-table/row',

  /**
   * Template for expanded row
   *
   * @type {string}
   * @default 'components/models-table/expanded-row'
   * @name ModelsTable#expandedRowTemplate
   */
  expandedRowTemplate: 'components/models-table/expanded-row',

  /**
   * Indexes of the expanded rows
   * It's set to the initial value when current page or page size is changed
   *
   * @type {number[]}
   * @private
   * @name ModelsTable#_expandedRowIndexes
   */
  _expandedRowIndexes: null,

  /**
   * true - allow to expand more than 1 row
   * false - only 1 row may be expanded in the same time
   *
   * @type {boolean}
   * @default false
   * @name ModelsTable#multipleExpand
   */
  multipleExpand: false,

  /**
   * @type {object[]}
   * @private
   * @name ModelsTable#_selectedItems
   */
  _selectedItems: null,

  /**
   * @type {boolean}
   * @default false
   * @name ModelsTable#multipleSelect
   */
  multipleSelect: false,

  /**
   * Action-name sent on user interaction
   *
   * @type {string}
   * @default 'displayDataChanged'
   * @name ModelsTable#displayDataChangedAction
   */
  displayDataChangedAction: 'displayDataChanged',

  /**
   * Determines if action on user interaction should be sent
   *
   * @default false
   * @type {boolean}
   * @name ModelsTable#sendDisplayDataChangedAction
   */
  sendDisplayDataChangedAction: false,

  /**
   * Action-name sent on change of visible columns
   *
   * @type {string}
   * @default 'columnsVisibilityChanged'
   * @name ModelsTable#columnsVisibilityChangedAction
   */
  columnsVisibilityChangedAction: 'columnsVisibilityChanged',

  /**
   * Determines if action on change of visible columns should be sent
   *
   * @default false
   * @type {boolean}
   * @name ModelsTable#sendColumnsVisibilityChangedAction
   */
  sendColumnsVisibilityChangedAction: false,

  /**
   * List of the currently visible columns
   *
   * @type {Ember.Object[]}
   * @default []
   * @name ModelsTable#visibleProcessedColumns
   */
  visibleProcessedColumns: computed.filterBy('processedColumns', 'isVisible', true),

  /**
   * True if all processedColumns are hidden by <code>isHidden</code>
   *
   * @type {boolean}
   * @name ModelsTable#allColumnsAreHidden
   */
  allColumnsAreHidden: computed('processedColumns.@each.isHidden', function () {
    var processedColumns = get(this, 'processedColumns');
    return processedColumns.length > 0 && processedColumns.isEvery('isHidden', true);
  }),

  /**
   * @type {boolean}
   */
  globalFilterUsed: computed.notEmpty('filterString'),

  /**
   * Global filter or filter by any column is used
   *
   * @type {boolean}
   */
  anyFilterUsed: computed('globalFilterUsed', 'processedColumns.@each.filterUsed', function () {
    return get(this, 'globalFilterUsed') || get(this, 'processedColumns').isAny('filterUsed');
  }),

  /**
   * Number of pages
   *
   * @type {number}
   * @name ModelsTable#pagesCount
   */
  pagesCount: computed('arrangedContent.[]', 'pageSize', function () {
    var pagesCount = get(this, 'arrangedContent.length') / parseInt(get(this, 'pageSize'), 10);
    return 0 === pagesCount % 1 ? pagesCount : Math.floor(pagesCount) + 1;
  }),

  /**
   * List of links to the page
   * Used if <code>useNumericPagination</code> is true
   * @typedef {object} visiblePageNumber
   * @property {boolean} isLink
   * @property {boolean} isActive
   * @property {string} label
   *
   * @type {visiblePageNumber[]}
   * @name ModelsTable#visiblePageNumbers
   */
  visiblePageNumbers: computed('arrangedContentLength', 'pagesCount', 'currentPageNumber', function () {
    var _getProperties = getProperties(this, 'pagesCount', 'currentPageNumber');

    var pagesCount = _getProperties.pagesCount;
    var currentPageNumber = _getProperties.currentPageNumber;

    var notLinkLabel = '...';
    var groups = []; // array of 8 numbers
    var labels = A([]);
    groups[0] = 1;
    groups[1] = Math.min(1, pagesCount);
    groups[6] = Math.max(1, pagesCount);
    groups[7] = pagesCount;
    groups[3] = Math.max(groups[1] + 1, currentPageNumber - 1);
    groups[4] = Math.min(groups[6] - 1, currentPageNumber + 1);
    groups[2] = Math.floor((groups[1] + groups[3]) / 2);
    groups[5] = Math.floor((groups[4] + groups[6]) / 2);

    for (var n = groups[0]; n <= groups[1]; n++) {
      labels[n] = n;
    }
    var userGroup2 = groups[4] >= groups[3] && groups[3] - groups[1] > 1;
    if (userGroup2) {
      labels[groups[2]] = notLinkLabel;
    }
    for (var i = groups[3]; i <= groups[4]; i++) {
      labels[i] = i;
    }
    var userGroup5 = groups[4] >= groups[3] && groups[6] - groups[4] > 1;
    if (userGroup5) {
      labels[groups[5]] = notLinkLabel;
    }
    for (var i = groups[6]; i <= groups[7]; i++) {
      labels[i] = i;
    }
    return A(labels.compact().map(function (label) {
      return {
        label: label,
        isLink: label !== notLinkLabel,
        isActive: label === currentPageNumber };
    }));
  }),

  /**
   * Are buttons "Back" and "First" enabled
   *
   * @type {boolean}
   * @name ModelsTable#gotoBackEnabled
   */
  gotoBackEnabled: computed.gt('currentPageNumber', 1),

  /**
   * Are buttons "Next" and "Last" enabled
   *
   * @type {boolean}
   * @name ModelsTable#gotoForwardEnabled
   */
  gotoForwardEnabled: computed('currentPageNumber', 'pagesCount', function () {
    return get(this, 'currentPageNumber') < get(this, 'pagesCount');
  }),

  /**
   * @type {Ember.Object[]}
   * @name ModelsTable#filteredContent
   */
  filteredContent: computed('filterString', 'data.[]', 'useFilteringByColumns', 'processedColumns.@each.filterString', function () {
    var _getProperties2 = getProperties(this, 'processedColumns', 'data', 'useFilteringByColumns', 'filteringIgnoreCase', 'doFilteringByHiddenColumns');

    var processedColumns = _getProperties2.processedColumns;
    var data = _getProperties2.data;
    var useFilteringByColumns = _getProperties2.useFilteringByColumns;
    var filteringIgnoreCase = _getProperties2.filteringIgnoreCase;
    var doFilteringByHiddenColumns = _getProperties2.doFilteringByHiddenColumns;

    var filterString = get(this, 'filterString');

    if (!data) {
      return A([]);
    }

    var _processedColumns = processedColumns;
    if (!doFilteringByHiddenColumns) {
      _processedColumns = _processedColumns.filterBy('isHidden', false);
    }

    // global search
    var globalSearch = data.filter(function (row) {
      return _processedColumns.length ? _processedColumns.any(function (c) {
        var filterFor = get(c, 'filteredBy') || get(c, 'propertyName');
        if (filterFor) {
          var cellValue = '' + get(row, filterFor);
          if (filteringIgnoreCase) {
            cellValue = cellValue.toLowerCase();
            filterString = filterString.toLowerCase();
          }
          return -1 !== cellValue.indexOf(filterString);
        }
        return false;
      }) : true;
    });

    if (!useFilteringByColumns) {
      return A(globalSearch);
    }

    // search by each column
    return A(globalSearch.filter(function (row) {
      return _processedColumns.length ? _processedColumns.every(function (c) {
        var filterFor = get(c, 'filteredBy') || get(c, 'propertyName');
        if (filterFor) {
          var cellValue = '' + get(row, filterFor);
          if (get(c, 'useFilter')) {
            var filterString = get(c, 'filterString');
            if (get(c, 'filterWithSelect') && '' === filterString) {
              return true;
            }
            if (filteringIgnoreCase) {
              cellValue = cellValue.toLowerCase();
              filterString = filterString.toLowerCase();
            }
            return 'function' === typeOf(c.filterFunction) ? c.filterFunction(cellValue, filterString, row) : 0 === compare(cellValue, filterString);
          }
          return true;
        }
        return true;
      }) : true;
    }));
  }),

  /**
   * @type {Ember.Object[]}
   * @name ModelsTable#arrangedContent
   */
  arrangedContent: computed('filteredContent.[]', 'sortProperties.[]', function () {
    var filteredContent = get(this, 'filteredContent');
    var sortProperties = get(this, 'sortProperties').map(function (p) {
      var _p$split = p.split(':');

      var _p$split2 = _slicedToArray(_p$split, 2);

      var prop = _p$split2[0];
      var direction = _p$split2[1];

      direction = direction || 'asc';

      return [prop, direction];
    });

    var _filteredContent = filteredContent.slice();
    return sortProperties.length ? A(_filteredContent.sort(function (row1, row2) {
      for (var i = 0; i < sortProperties.length; i++) {
        var _sortProperties$i = _slicedToArray(sortProperties[i], 2);

        var prop = _sortProperties$i[0];
        var direction = _sortProperties$i[1];

        var result = compare(get(row1, prop), get(row2, prop));
        if (result !== 0) {
          return direction === 'desc' ? -1 * result : result;
        }
      }

      return 0;
    })) : _filteredContent;
  }),

  /**
   * Content of the current table page
   *
   * @type {Ember.Object[]}
   * @name ModelsTable#visibleContent
   */
  visibleContent: computed('arrangedContent.[]', 'pageSize', 'currentPageNumber', function () {
    var _getProperties3 = getProperties(this, 'arrangedContent', 'pageSize', 'currentPageNumber');

    var arrangedContent = _getProperties3.arrangedContent;
    var pageSize = _getProperties3.pageSize;
    var currentPageNumber = _getProperties3.currentPageNumber;

    pageSize = parseInt(pageSize, 10);
    var startIndex = pageSize * (currentPageNumber - 1);
    if (get(arrangedContent, 'length') < pageSize) {
      return arrangedContent;
    }
    return A(arrangedContent.slice(startIndex, startIndex + pageSize));
  }),

  /**
   * Real table summary
   *
   * @type {string}
   * @name ModelsTable#summary
   */
  summary: computed('firstIndex', 'lastIndex', 'arrangedContentLength', 'messages.tableSummary', function () {
    var _getProperties4 = getProperties(this, 'arrangedContentLength', 'firstIndex', 'lastIndex');

    var arrangedContentLength = _getProperties4.arrangedContentLength;
    var firstIndex = _getProperties4.firstIndex;
    var lastIndex = _getProperties4.lastIndex;

    return fmt(get(this, 'messages.tableSummary'), firstIndex, lastIndex, arrangedContentLength);
  }),

  /**
   * Is user on the last page
   *
   * @type {boolean}
   * @name ModelsTable#isLastPage
   */
  isLastPage: computed.not('gotoForwardEnabled'),

  /**
   * Alias to <code>arrangedContent.length</code>
   *
   * @type {number}
   * @name ModelsTable#arrangedContentLength
   */
  arrangedContentLength: computed.alias('arrangedContent.length'),

  /**
   * Index of the first currently shown record
   *
   * @type {number}
   * @name ModelsTable#firstIndex
   */
  firstIndex: computed('arrangedContentLength', 'pageSize', 'currentPageNumber', function () {
    var _getProperties5 = getProperties(this, 'currentPageNumber', 'pageSize', 'arrangedContentLength');

    var currentPageNumber = _getProperties5.currentPageNumber;
    var pageSize = _getProperties5.pageSize;
    var arrangedContentLength = _getProperties5.arrangedContentLength;

    return 0 === arrangedContentLength ? 0 : parseInt(pageSize, 10) * (currentPageNumber - 1) + 1;
  }),

  /**
   * Index of the last shown record
   *
   * @type {number}
   * @name ModelsTable#lastIndex
   */
  lastIndex: computed('isLastPage', 'arrangedContentLength', 'currentPageNumber', 'pageSize', function () {
    var _getProperties6 = getProperties(this, 'currentPageNumber', 'pageSize', 'isLastPage', 'arrangedContentLength');

    var currentPageNumber = _getProperties6.currentPageNumber;
    var pageSize = _getProperties6.pageSize;
    var isLastPage = _getProperties6.isLastPage;
    var arrangedContentLength = _getProperties6.arrangedContentLength;

    return isLastPage ? arrangedContentLength : currentPageNumber * parseInt(pageSize, 10);
  }),

  /**
   * List of possible <code>pageSize</code> values
   * Used to change size of <code>visibleContent</code>
   *
   * @type {number[]}
   * @default [10, 25, 50]
   * @name ModelsTable#pageSizeValues
   */
  pageSizeValues: A([10, 25, 50]),

  /**
   * Show first page if for some reasons there is no content for current page, but table data exists
   *
   * @method visibleContentObserver
   * @name ModelsTable#visibleContentObserver
   * @private
   */
  visibleContentObserver: function visibleContentObserver() {
    run.once(this, this.visibleContentObserverOnce);
  },

  /**
   * @private
   */
  visibleContentObserverOnce: function visibleContentObserverOnce() {
    var visibleContentLength = get(this, 'visibleContent.length');
    var dataLength = get(this, 'data.length');
    var currentPageNumber = get(this, 'currentPageNumber');
    if (!visibleContentLength && dataLength && currentPageNumber !== 1) {
      set(this, 'currentPageNumber', 1);
    }
  },

  /**
   * @method contentChangedAfterPolling
   * @name ModelsTable#contentChangedAfterPolling
   * @private
   */
  contentChangedAfterPolling: function contentChangedAfterPolling() {
    run.once(this, this.contentChangedAfterPollingOnce);
  },

  /**
   * @private
   */
  contentChangedAfterPollingOnce: function contentChangedAfterPollingOnce() {
    get(this, 'filteredContent');
    this.notifyPropertyChange('filteredContent');
  },

  /**
   * Component init
   * Set visibility and filtering attributes for each column
   * Update messages used by table with user-provided messages (@see messages)
   * Update icons used by table with user-provided icons (@see icons)
   * Update classes used by table with user-provided css-classes (@see classes)
   *
   * @method setup
   * @name ModelsTable#setup
   */
  setup: on('init', function () {
    var _this = this;

    this._setupSelectedRows();
    this._setupExpandedRows();
    this._setupColumns();
    this._setupMessages();
    this._setupIcons();
    this._setupClasses();
    var columnsAreUpdateable = get(this, 'columnsAreUpdateable');
    if (columnsAreUpdateable) {
      var columnFieldsToCheckUpdate = get(this, 'columnFieldsToCheckUpdate');
      assert('`columnFieldsToCheckUpdate` should be an array of strings', 'array' === typeOf(columnFieldsToCheckUpdate));
      columnFieldsToCheckUpdate.forEach(function (propertyName) {
        return _this.addObserver('columns.@each.' + propertyName, _this, _this._setupColumnsOnce);
      });
    }
    this.addObserver('visibleContent.length', this, this.visibleContentObserver);
  }),

  /**
   * Recalculate processedColumns when the columns attr changes
   */
  updateColumns: on('didReceiveAttrs', function () {
    if (get(this, 'columnsAreUpdateable')) {
      this._setupColumns();
    }
  }),

  /**
   * Focus on "Global filter" on component render
   *
   * @method focus
   * @name ModelsTable#focus
   */
  focus: on('didInsertElement', function () {
    if (get(this, 'showGlobalFilter') && get(this, 'focusGlobalFilter')) {
      jQ('.filterString').focus();
    }
  }),

  _setupExpandedRows: function _setupExpandedRows() {
    set(this, '_expandedRowIndexes', A([]));
  },

  _setupSelectedRows: function _setupSelectedRows() {
    set(this, '_selectedItems', A([]));
  },

  /**
   * Wrapper for <code>_setupColumns</code> to call it only once when observer is fired
   *
   * @method _setupColumnsOnce
   * @name ModelsTable#_setupColumnsOnce
   * @private
   */
  _setupColumnsOnce: function _setupColumnsOnce() {
    run.once(this, this._setupColumns);
  },

  /**
   * Create new properties for <code>columns</code> (filterString, useFilter, isVisible, defaultVisible)
   *
   * @method _setupColumns
   * @private
   * @name ModelsTable#_setupColumns
   */
  _setupColumns: function _setupColumns() {
    var _this2 = this;

    var self = this;

    var nColumns = A(get(this, 'columns').map(function (column) {
      var filterFunction = get(column, 'filterFunction');
      filterFunction = 'function' === typeOf(filterFunction) ? filterFunction : defaultFilter;

      var c = ModelsTableColumn.create(column);
      var propertyName = get(c, 'propertyName');
      var sortedBy = get(c, 'sortedBy');
      var filteredBy = get(c, 'filteredBy');
      setProperties(c, {
        data: get(_this2, 'data'),
        filterString: get(c, 'filterString') || '',
        useFilter: !isNone(filteredBy || propertyName) && !get(c, 'disableFiltering'),
        useSorting: !isNone(sortedBy || propertyName) && !get(c, 'disableSorting')
      });

      set(c, 'filterFunction', filterFunction);

      if (isNone(get(c, 'mayBeHidden'))) {
        set(c, 'mayBeHidden', true);
      }

      var sortDirection = column.sortDirection;
      var sortPrecedence = column.sortPrecedence;

      var hasSortPrecedence = !isNone(sortPrecedence) && sortPrecedence > NOT_SORTED;
      var defaultSortPrecedence = hasSortPrecedence ? sortPrecedence : NOT_SORTED;
      var defaultSorting = sortDirection && sortPrecedence > NOT_SORTED ? sortDirection.toLowerCase() : 'none';

      setProperties(c, {
        defaultVisible: !get(c, 'isHidden'),
        sorting: defaultSorting,
        sortPrecedence: defaultSortPrecedence
      });

      if (get(c, 'filterWithSelect') && get(c, 'useFilter')) {
        var predefinedFilterOptions = get(column, 'predefinedFilterOptions');
        if (predefinedFilterOptions && predefinedFilterOptions.length && '' !== predefinedFilterOptions[0]) {
          predefinedFilterOptions = [''].concat(predefinedFilterOptions);
        }
        var usePredefinedFilterOptions = 'array' === typeOf(predefinedFilterOptions);
        set(c, 'filterOptions', usePredefinedFilterOptions ? predefinedFilterOptions : []);
        if (!usePredefinedFilterOptions && propertyName) {
          set(c, 'filterOptions', getFilterOptionsCP(propertyName));
        }
      }
      return c;
    }));
    nColumns.filterBy('propertyName').forEach(function (column) {
      var propertyName = get(column, 'propertyName');
      if (isNone(get(column, 'title'))) {
        set(column, 'title', propertyNameToTitle(propertyName));
      }
    });
    set(this, 'processedColumns', nColumns);

    // Apply initial sorting
    set(this, 'sortProperties', A());
    var filteredOrderedColumns = nColumns.sortBy('sortPrecedence').filter(function (col) {
      return isSortedByDefault(col);
    });
    filteredOrderedColumns.forEach(function (column) {
      self.send('sort', column);
      var defaultSortedBy = column.sortedBy || column.propertyName;
      var sortingArgs = [column, defaultSortedBy, column.sortDirection.toLowerCase()];
      if (get(_this2, 'multipleColumnsSorting')) {
        _this2._multiColumnsSorting.apply(_this2, sortingArgs);
      } else {
        _this2._singleColumnSorting.apply(_this2, sortingArgs);
      }
    });
  },

  /**
   * Update messages used by widget with custom values provided by user in the <code>customMessages</code>
   *
   * @method _setupMessages
   * @private
   * @name ModelsTable#_setupMessages
   */
  _setupMessages: observer('customMessages', function () {
    var customIcons = getWithDefault(this, 'customMessages', {});
    var newMessages = {};
    assign(newMessages, defaultMessages, customIcons);
    set(this, 'messages', O.create(newMessages));
  }),

  /**
   * Update icons-classes used by widget with custom values provided by user in the <code>customIcons</code>
   *
   * @method _setupIcons
   * @private
   * @name ModelsTable#_setupIcons
   */
  _setupIcons: function _setupIcons() {
    var customIcons = getWithDefault(this, 'customIcons', {});
    var newIcons = {};
    assign(newIcons, defaultIcons, customIcons);
    set(this, 'icons', O.create(newIcons));
  },

  /**
   * Update css-classes used by widget with custom values provided by user in the <code>customClasses</code>
   *
   * @method _setupClasses
   * @private
   * @name ModelsTable#_setupClasses
   */
  _setupClasses: function _setupClasses() {
    var customClasses = getWithDefault(this, 'customClasses', {});
    var newClasses = {};
    assign(newClasses, defaultCssClasses, customClasses);
    set(this, 'classes', O.create(newClasses));
  },

  /**
   * Set <code>sortProperties</code> when single-column sorting is used
   *
   * @param {ModelsTable~ModelsTableColumn} column
   * @param {string} sortedBy
   * @param {string} newSorting 'asc|desc|none'
   * @method _singleColumnSorting
   * @private
   * @name ModelsTable#_singleColumnSorting
   */
  _singleColumnSorting: function _singleColumnSorting(column, sortedBy, newSorting) {
    get(this, 'processedColumns').setEach('sorting', 'none');
    set(column, 'sorting', newSorting);
    set(this, 'sortProperties', 'none' === newSorting ? [] : [sortedBy + ':' + newSorting]);
  },

  /**
   * Set <code>sortProperties</code> when multi-columns sorting is used
   *
   * @param {ModelsTable~ModelsTableColumn} column
   * @param {string} sortedBy
   * @param {string} newSorting 'asc|desc|none'
   * @method _multiColumnsSorting
   * @private
   * @name ModelsTable#_multiColumnsSorting
   */
  _multiColumnsSorting: function _multiColumnsSorting(column, sortedBy, newSorting) {
    set(column, 'sorting', newSorting);
    var sortProperties = get(this, 'sortProperties');
    var sortPropertiesMap = {};
    sortProperties.forEach(function (p) {
      var _p$split3 = p.split(':');

      var _p$split32 = _slicedToArray(_p$split3, 2);

      var propertyName = _p$split32[0];
      var order = _p$split32[1];

      sortPropertiesMap[propertyName] = order;
    });
    delete sortPropertiesMap[sortedBy];

    var newSortProperties = A([]);
    keys(sortPropertiesMap).forEach(function (propertyName) {
      if (propertyName !== sortedBy) {
        newSortProperties.pushObject(propertyName + ':' + sortPropertiesMap[propertyName]);
      }
    });
    if ('none' !== newSorting) {
      newSortProperties.pushObject(sortedBy + ':' + newSorting);
    }
    set(this, 'sortProperties', newSortProperties);
  },

  /**
   * send <code>displayDataChangedAction</code>-action when user does sort of filter
   * action is sent only if <code>sendDisplayDataChangedAction</code> is true (default false)
   *
   * @name ModelsTable#userInteractionObserver
   * @method userInteractionObserver
   * @private
   */
  userInteractionObserver: function userInteractionObserver() {
    run.once(this, this.userInteractionObserverOnce);
  },

  /**
   * @private
   */
  userInteractionObserverOnce: function userInteractionObserverOnce() {
    var _this3 = this;

    if (get(this, 'sendDisplayDataChangedAction')) {
      (function () {
        var columns = get(_this3, 'processedColumns');
        var settings = O.create({
          sort: get(_this3, 'sortProperties'),
          currentPageNumber: get(_this3, 'currentPageNumber'),
          pageSize: parseInt(get(_this3, 'pageSize'), 10),
          filterString: get(_this3, 'filterString'),
          filteredContent: get(_this3, 'filteredContent'),
          selectedItems: get(_this3, '_selectedItems'),
          expandedRowIndexes: get(_this3, '_expandedRowIndexes'),
          columnFilters: {}
        });
        columns.forEach(function (column) {
          if (get(column, 'filterString')) {
            settings.columnFilters[get(column, 'propertyName')] = get(column, 'filterString');
          }
        });
        _this3.sendAction('displayDataChangedAction', settings);
      })();
    }
  },

  /**
   * send <code>columnsVisibilityChangedAction</code>-action when user changes which columns are visible
   * action is sent only if <code>sendColumnsVisibilityChangedAction</code> is true (default false)
   */
  _sendColumnsVisibilityChangedAction: function _sendColumnsVisibilityChangedAction() {
    if (get(this, 'sendColumnsVisibilityChangedAction')) {
      var columns = get(this, 'processedColumns');
      var columnsVisibility = columns.map(function (column) {
        var options = getProperties(column, 'isHidden', 'mayBeHidden', 'propertyName');
        options.isHidden = !!options.isHidden;
        return options;
      });
      this.sendAction('columnsVisibilityChangedAction', columnsVisibility);
    }
  },

  /**
   * Force <code>arrangedContent</code> to be updated when <code>sortProperties</code> is changed
   * Currently "normal" <code>Em.computed.sort</code> has issue when sort properties is empty
   *
   * @method forceUpdateArrangedContent
   * @name ModelsTable#forseUpdateArrangedContent
   * @private
   */
  forceUpdateArrangedContent: observer('filteredContent.[]', 'sortProperties.[]', function () {
    this.notifyPropertyChange('arrangedContent');
  }),

  /**
   * Handler for global filter and filter by each column
   *
   * @method filteringApplied
   * @name ModelsTable#filteringApplied
   * @private
   */
  filteringApplied: observer('filterString', 'processedColumns.@each.filterString', function () {
    set(this, 'currentPageNumber', 1);
    this.userInteractionObserver();
  }),

  /**
   * Handler for <code>pageSize</code> changing
   *
   * @method paginationApplied
   * @name ModelsTable#paginationApplied
   * @private
   */
  paginationApplied: observer('pageSize', function () {
    set(this, 'currentPageNumber', 1);
    this.userInteractionObserver();
  }),

  /**
   * Collapse open rows when user change page size or moved to the another page
   *
   * @method collapseRow
   * @name ModelsTable#collapseRow
   * @private
   */
  collapseRow: observer('currentPageNumber', 'pageSize', function () {
    set(this, '_expandedRowIndexes', A([]));
  }),

  actions: {

    sendAction: function sendAction() {
      this.sendAction.apply(this, arguments);
    },

    /**
     * @param {ModelsTable~ModelsTableColumn} column
     */
    toggleHidden: function toggleHidden(column) {
      if (get(column, 'mayBeHidden')) {
        column.toggleProperty('isHidden');
        this._sendColumnsVisibilityChangedAction();
      }
    },

    showAllColumns: function showAllColumns() {
      get(this, 'processedColumns').setEach('isHidden', false);
      this._sendColumnsVisibilityChangedAction();
    },

    hideAllColumns: function hideAllColumns() {
      get(this, 'processedColumns').setEach('isHidden', true);
      this._sendColumnsVisibilityChangedAction();
    },

    restoreDefaultVisibility: function restoreDefaultVisibility() {
      var _this4 = this;

      get(this, 'processedColumns').forEach(function (c) {
        set(c, 'isHidden', !get(c, 'defaultVisible'));
        _this4._sendColumnsVisibilityChangedAction();
      });
    },

    gotoFirst: function gotoFirst() {
      if (!get(this, 'gotoBackEnabled')) {
        return;
      }
      set(this, 'currentPageNumber', 1);
      this.userInteractionObserver();
    },

    gotoPrev: function gotoPrev() {
      if (!get(this, 'gotoBackEnabled')) {
        return;
      }
      if (get(this, 'currentPageNumber') > 1) {
        this.decrementProperty('currentPageNumber');
        this.userInteractionObserver();
      }
    },

    gotoNext: function gotoNext() {
      if (!get(this, 'gotoForwardEnabled')) {
        return;
      }
      var currentPageNumber = get(this, 'currentPageNumber');
      var pageSize = parseInt(get(this, 'pageSize'), 10);
      var arrangedContentLength = get(this, 'arrangedContent.length');
      if (arrangedContentLength > pageSize * (currentPageNumber - 1)) {
        this.incrementProperty('currentPageNumber');
        this.userInteractionObserver();
      }
    },

    gotoLast: function gotoLast() {
      if (!get(this, 'gotoForwardEnabled')) {
        return;
      }
      var pageSize = parseInt(get(this, 'pageSize'), 10);
      var arrangedContentLength = get(this, 'arrangedContent.length');
      var pageNumber = arrangedContentLength / pageSize;
      pageNumber = 0 === pageNumber % 1 ? pageNumber : Math.floor(pageNumber) + 1;
      set(this, 'currentPageNumber', pageNumber);
      this.userInteractionObserver();
    },

    gotoCustomPage: function gotoCustomPage(pageNumber) {
      set(this, 'currentPageNumber', pageNumber);
      this.userInteractionObserver();
    },

    /**
     * @param {ModelsTable~ModelsTableColumn} column
     */
    sort: function sort(column) {
      var sortMap = {
        none: 'asc',
        asc: 'desc',
        desc: 'none'
      };
      var sortedBy = get(column, 'sortedBy') || get(column, 'propertyName');
      if (isNone(sortedBy)) {
        return;
      }
      var currentSorting = get(column, 'sorting');
      var newSorting = sortMap[currentSorting.toLowerCase()];
      var sortingArgs = [column, sortedBy, newSorting];
      if (get(this, 'multipleColumnsSorting')) {
        this._multiColumnsSorting.apply(this, sortingArgs);
      } else {
        this._singleColumnSorting.apply(this, sortingArgs);
      }
      set(this, 'currentPageNumber', 1);
      this.userInteractionObserver();
    },

    expandRow: function expandRow(index) {
      assert('row index should be numeric', typeOf(index) === 'number');
      var multipleExpand = get(this, 'multipleExpand');
      var expandedRowIndexes = get(this, '_expandedRowIndexes');
      if (multipleExpand) {
        expandedRowIndexes.pushObject(index);
      } else {
        if (expandedRowIndexes.length === 1) {
          expandedRowIndexes.clear();
        }
        expandedRowIndexes.pushObject(index);
      }
      set(this, '_expandedRowIndexes', expandedRowIndexes);
      this.userInteractionObserver();
    },

    collapseRow: function collapseRow(index) {
      assert('row index should be numeric', typeOf(index) === 'number');
      var expandedRowIndexes = get(this, '_expandedRowIndexes').without(index);
      set(this, '_expandedRowIndexes', expandedRowIndexes);
      this.userInteractionObserver();
    },

    /**
     * Handler for row-click
     * Toggle <code>selected</code>-state for row
     * Select only one or multiple rows depends on <code>multipleSelect</code>-value
     *
     * @param {number} index
     * @param {object} dataItem
     */
    clickOnRow: function clickOnRow(index, dataItem) {
      assert('row index should be numeric', typeOf(index) === 'number');
      var multipleSelect = get(this, 'multipleSelect');
      var selectedItems = get(this, '_selectedItems');
      if (selectedItems.includes(dataItem)) {
        selectedItems = selectedItems.without(dataItem);
        set(this, '_selectedItems', selectedItems);
      } else {
        if (multipleSelect) {
          get(this, '_selectedItems').pushObject(dataItem);
        } else {
          if (selectedItems.length === 1) {
            get(this, '_selectedItems').clear();
          }
          get(this, '_selectedItems').pushObject(dataItem);
        }
      }
      this.userInteractionObserver();
    },

    /**
     * Clear all column filters and global filter
     */
    clearFilters: function clearFilters() {
      set(this, 'filterString', '');
      get(this, 'processedColumns').setEach('filterString', '');
    }

  }

});