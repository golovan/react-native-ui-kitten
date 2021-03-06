/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { List } from 'immutable';
import { Subscription } from 'rxjs/Subscription';

import { DocsService } from './docs.service';
import { NgaMenuService, NgaMenuItem } from '@akveo/nga-theme';
import { NgaMenuInternalService } from '@akveo/nga-theme/components/menu/menu.service';

import 'rxjs/add/operator/filter';

@Component({
  selector: 'react-docs',
  styleUrls: ['docs.component.scss'],
  template: `
     <nga-layout>
      <nga-layout-header fixed>
        <react-header></react-header>
      </nga-layout-header>
      <nga-sidebar>
        <nga-sidebar-content>
          <nga-menu [items]="menuItems" tag="leftMenu"></nga-menu>
        </nga-sidebar-content>
      </nga-sidebar>
      <nga-layout-column>
        <router-outlet></router-outlet>
      </nga-layout-column>
      <nga-sidebar right *ngIf="demoUrl">
        <react-phone-block [demoUrl]="demoUrl"></react-phone-block> 
      </nga-sidebar>
    </nga-layout>
  `,
})
export class ReactDocsComponent implements OnInit, AfterViewInit, OnDestroy {

  structure: any;
  menuItems: List<NgaMenuItem> = List([]);
  demoUrl: string;
  private menuItemSubscription: Subscription;
  private routerSubscription: Subscription;

  constructor(private service: DocsService,
              private router: Router,
              private menuInternalService: NgaMenuInternalService,
              private menuService: NgaMenuService) {
  }

  ngOnInit() {
    this.menuItems = this.service.getPreparedMenu();
    this.structure = this.service.getPreparedStructure();
  }

	ngAfterViewInit() {
    this.menuItemSubscription = this.menuService.getSelectedItem().subscribe((data) => {
      if (data.item) this.menuInternalService.itemSelect(data.item);
    });

    this.routerSubscription = this.router.events
      .filter(event => event instanceof NavigationEnd && event['url'] === '/docs')
      .subscribe((event) => {
        let firstMenuItem = this.menuItems.get(0).children.get(0);
        this.menuInternalService.itemSelect(firstMenuItem);
        this.router.navigateByUrl(firstMenuItem.link);
      });

    this.menuService.onItemSelect().subscribe((event: {tag: string, item: any}) => {
      if (event && event.item && event.item.data && event.item.data.demogif) {
        this.demoUrl = event.item.data.demogif;
        this.demoUrl = require(`../../assets/gif/${this.demoUrl}`);
      } else {
        this.demoUrl = '';
      }
    });
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
    this.menuItemSubscription.unsubscribe();
  }
}
