import {Component, OnDestroy, OnInit} from '@angular/core';
import {interval, Subscription} from 'rxjs';

const generateRow = (id) => {
  const genString = (length) => {
    let result = '';
    const characters: any = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  const genInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  return {
    id,
    name: `Name ${genString(5)}`,
    leads: genInt(500, 1000),
    revenue: genInt(500, 1000),
    rpl: genInt(5, 20),
    details: [],
    isExpanded: false,
  }
};

const dropdownsStructure = {
  'dd 1 lvl 1': [
    'dd 11 lvl 2',
    'dd 12 lvl 2',
    'dd 13 lvl 2',
    'dd 14 lvl 2',
  ],
  'dd 2 lvl 1': [
    'dd 21 lvl 2',
    'dd 22 lvl 2',
    'dd 23 lvl 2',
    'dd 24 lvl 2',
  ],
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  rows: Array<any> = [];
  expandedRawsIdList: Array<string> = [];
  dateSelect: string = '0';
  subscriptions: Array<Subscription> = [];
  sourceDropdownContent = Object.keys(dropdownsStructure);
  sourceSelect = Object.keys(dropdownsStructure)[0];
  secondDropdownContent: Array<string>;
  secondSelect: string;

  theadTdList = [
    {
      colname: 'name',
      sort: null,
    },
    {
      colname: 'leads',
      sort: null,
    },
    {
      colname: 'revenue',
      sort: null,
    },
    {
      colname: 'rpl',
      sort: null,
    },
  ];

  ngOnInit(): void {
    this.getRows();

    const sub = interval(30000).subscribe(() => {
      this.getRows();
      this.expandedRawsIdList
        .forEach(id => {
          this.getRowDetails(id);
          this.rows.find(row => row.id === id).isExpanded = true;
        })
    });

    this.subscriptions.push(sub);

    this.secondDropdownContent = dropdownsStructure[this.sourceSelect];
    this.secondSelect = this.secondDropdownContent[0];
  }

  getRows() {
    const rows = [];
    for (let i = 0; i < 11; i++) {
      rows.push(generateRow(i));
    }

    this.rows = rows;
    this.sortTable();
  }

  getRowDetails(id: string): void {
    const details = [];

    for (let i = 0; i <= +this.dateSelect; i++) {
      const detail: any = generateRow(i);
      let date = new Date();
      date = new Date(date.setDate(date.getDate() - i));
      detail.date = date.getTime();
      details.push(detail);
    }

    this.rows.find(row => row.id === id).details = details;
  }

  rowClick(id: string): void {
    const row = this.rows.find(row => row.id === id);

    if (!row.isExpanded) {
      this.expandedRawsIdList.push(id);
      this.getRowDetails(id);
    } else {
      this.expandedRawsIdList = this.expandedRawsIdList.filter(rid => rid !== id);
    }

    row.isExpanded = !row.isExpanded;
  }

  dateSelectChanged() {
    this.expandedRawsIdList.forEach(id => this.getRowDetails(id));
  }

  sourceDropdownClick() {
    this.getRows();
    this.secondDropdownContent = dropdownsStructure[this.sourceSelect];
  }

  secondDropdownClick() {
    this.getRows();
  }

  theadClick(e) {
    const colname = e.target.innerText;
    const clickedCol = this.theadTdList.find(c => c.colname === colname);
    const sortedCol = this.theadTdList.find(c => c.sort !== null);

    if (clickedCol.colname === sortedCol?.colname) {
      clickedCol.sort === 'desc' ?
        clickedCol.sort = 'asc'
        : clickedCol.sort = 'desc';
    } else {
      sortedCol && (sortedCol.sort = null);

      if (!clickedCol.sort) {
        clickedCol.sort = 'desc';
      } else if (clickedCol.sort === 'desc') {
        clickedCol.sort = 'asc';
      }
    }

    this.sortTable();
  }

  sortTable() {
    const colSelectedForSort = this.theadTdList.find(c => c.sort !== null);
    if (colSelectedForSort) {
      const rowsSorted = this.rows.sort((a, b) => {
        if (typeof a === 'string') {
          a = a.toLowerCase();
          b = b.toLowerCase();
        }

        if (a[colSelectedForSort.colname] < b[colSelectedForSort.colname]) return -1;
        else if (a[colSelectedForSort.colname] > b[colSelectedForSort.colname]) return 1;
        else return 0;
      });

      if (colSelectedForSort.sort === 'desc') {
        this.rows = rowsSorted;
      } else if (colSelectedForSort.sort === 'asc') {
        this.rows = rowsSorted.reverse();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
