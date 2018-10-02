import {Component, Input, ViewChild, ViewContainerRef, OnChanges} from '@angular/core'
import { Router } from '@angular/router'; 

import { ConfirmDialogService } from "../../../../shared/components/confirm-dialog/confirm-dialog.service";
import { KeycloakService } from "../../../../shared/keycloak/keycloak.service";

import { ExtraData } from '../shared/extradata.model';
import { ExaminationExtraDataService } from '../shared/extradata.service';
import { ImagesUrlUtil } from '../../../../shared/utils/images-url.util';
import { FilterablePageable, Page } from '../../../../shared/components/table/pageable.model';
import { BrowserPaging } from '../../../../shared/components/table/browser-paging.model';
import { TableComponent } from '../../../../shared/components/table/table.component';

@Component({
  selector: 'extradata-list',
  templateUrl:'extradata-list.component.html',
  styleUrls: ['extradata-list.component.css'], 
  providers: [ExaminationExtraDataService]
})
export class ExtraDataListComponent {
  @Input() examination_id:number;
  @Input() extradatas: ExtraData[] = [];
  private extraDataPromise: Promise<void> = this.getExtraDatas(this.examination_id);
  private browserPaging: BrowserPaging<ExtraData>;
  public rowClickAction: Object;
  public columnDefs: any[];
  public customActionDefs: any[];
  @ViewChild('extradataTable') table: TableComponent;
      
    constructor(
        public extradataService: ExaminationExtraDataService,
        public router: Router,
        private keycloakService: KeycloakService,
        public confirmDialogService: ConfirmDialogService, private viewContainerRef: ViewContainerRef) {
            
     }
    
    ngOnInit(){
        //this.getExtraDatas(this.examination_id);
        this.createColumnDefs();
    }
    
    ngOnChanges(){
        if(this.examination_id){
          //this.getExtraDatas(this.examination_id);
        }
        if(this.extradatas && this.extradatas.length > 0){
          //this.getExtraDatas(this.examination_id);
          this.createColumnDefs();
        }
    }
    
    getPage(pageable: FilterablePageable): Promise<Page<ExtraData>> {
        return new Promise((resolve) => {
            this.extraDataPromise.then(() => {
                resolve(this.browserPaging.getPage(pageable));
            });
        });
    }
    
    
    getExtraDatas(examId:number):Promise<void> {
    	this.extradatas = [];
    	this.browserPaging = new BrowserPaging(this.extradatas, this.columnDefs);
        if(this.examination_id){
            return this.extradataService.getExtraDatas(examId).then(extradatas => {
                this.extradatas = extradatas;
                
                this.browserPaging.setItems(extradatas);
            	this.browserPaging.setColumnDefs(this.columnDefs);
                this.table.refresh();
            })
         }
    }
    
    downloadExtraData = (extradata:ExtraData) => {
        window.open(this.extradataService.getDownloadUrl(extradata));
    }
    
    delete(extradata:ExtraData): void {      
      this.extradataService.delete(extradata).then((res) => this.getExtraDatas(this.examination_id));
    }
    
    
    // Grid columns definition
    private createColumnDefs() {
        function castToString(id: number) {
            return String(id);
        };
        function checkNullValue(value: any) {
            if(value){
                return value;
            }
            return '';
        };
        function checkNullValueReference(reference: any) {
            if(reference){
                return reference.value;
            }
            return '';
        };
        this.columnDefs = [
            {headerName: "Filename", field: "filename"},
            {headerName: "Data type", field: "extradatatype"},
            {headerName: "Has heart rate", field: "has_heart_rate", type: "boolean", cellRenderer: function (params: any) {
                return checkNullValue(params.data.has_heart_rate);
            }},
            {headerName: "Has respiratory rate", field: "has_respiratory_rate", type: "boolean", cellRenderer: function (params: any) {
                return checkNullValue(params.data.has_respiratory_rate);
            }},
            {headerName: "Has sao2", field: "has_sao2", type: "boolean", cellRenderer: function (params: any) {
                return checkNullValue(params.data.has_sao2);
            }},
            {headerName: "Has temperature", field: "has_temperature", type: "boolean", cellRenderer: function (params: any) {
                return checkNullValue(params.data.has_temperature);
            }}
        ];
        
        if (!this.keycloakService.isUserGuest()) {
            this.columnDefs.push({headerName: "", type: "button", img:  ImagesUrlUtil.DOWNLOAD_ICON_PATH, action: this.downloadExtraData,component:this});
        }
        if (this.keycloakService.isUserAdmin() || this.keycloakService.isUserExpert()) {
            this.columnDefs.push({headerName: "", type: "button", img: ImagesUrlUtil.GARBAGE_ICON_PATH, action: this.openDeleteExtraDataConfirmDialog});
        }
       
        this.customActionDefs = [];        
        this.customActionDefs.push({title: "delete selected", img: ImagesUrlUtil.GARBAGE_ICON_PATH, action: this.deleteAll });
          
    }
    
    private onRowClick(item: ExtraData) {
        if (!this.keycloakService.isUserGuest()) {
            this.router.navigate(['/preclinical-extradata'], { queryParams: { id: item.id, mode: "view" } });
        }
    }
    
    openDeleteExtraDataConfirmDialog = (item: ExtraData) => {
         this.confirmDialogService
                .confirm('Delete extra data', 'Are you sure you want to delete extra data ' + item.id + '?', 
                    this.viewContainerRef)
                .subscribe(res => {
                    if (res) {
                        this.delete(item);
                    }
                });
    }
    
    deleteAll = () => {
        let ids: number[] = [];
        for (let extradata of this.extradatas) {
            if (extradata["isSelectedInTable"]) ids.push(extradata.id);
        }
        if (ids.length > 0) {
            console.log("TODO : delete those ids : " + ids);
        }
    }

}