import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ModalListComponent } from 'src/app/components/modal-list/modal-list.component';
import { AppService } from 'src/app/service/app-service';
import { DynamicFormField } from 'src/app/service/interface/dynamic-form-field';


@Component({
  selector: 'app-dynamic-select-box',
  templateUrl: './dynamic-select-box.component.html',
  styleUrls: ['./dynamic-select-box.component.scss'],
})
export class DynamicSelectBoxComponent implements OnChanges, OnInit {
  @Input() config!: DynamicFormField;
  @Input() formControlD!: FormControl;
  @Input() parentValue!: string;
  @Input() disabled = false;
  @Input() value:any;
  @Input() values:any = [];
  @Input() labelPlacement:'fixed' | 'stacked' | 'floating' = 'fixed';
  @Output() valueChange = new EventEmitter<string | string[]>();

  
  availableOptions: any = [];
  
  selectOptions:any
  displayExp:any;
  valueExp:any;
  modalController=inject(ModalController)
  formService=inject(AppService)
  selectedValue!: string | string[];
  multiple: boolean= false;
  noCustom: boolean = true;
  noCustomOptions:any[]=[];
  isRemote:boolean=false;
  ngOnInit(): void {
    this.initializeOptions();
  }

  async initializeOptions(): Promise<void> {
    if (this.config && this.config.selectOptions) {
      this.selectOptions = this.config.selectOptions;
      this.displayExp = this.selectOptions.displayExp || 'value';
      this.valueExp = this.selectOptions.valueExp || 'id';
      this.isRemote = this.selectOptions.remote;
      if(this.isRemote){
        this.availableOptions = await this.getRemoteOptions(this.selectOptions.api)
      }else{
        this.availableOptions = this.selectOptions.options || [];
      }
      
      if (this.config.selectOptions.parent && this.parentValue) {
        this.availableOptions = this.availableOptions.filter((option:any) => option.parent === this.parentValue);
      }
      this.selectedValue = this.selectOptions.multiple ? this.values : this.value;

      this.formControlD?.setValue(this.selectedValue)
      this.multiple = this.selectOptions.multiple || false;
    }

    if(!this.noCustom){
      this.noCustomOptions = this.availableOptions.filter((res:any)=> res[this.valueExp] ==  this.selectedValue)
      this.noCustomOptions = this.noCustomOptions.map((r:any)=>{return r[this.displayExp]} )
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['parentValue'] || changes['config']) {
      if(typeof changes['parentValue']['currentValue'] != 'undefined' && changes['parentValue']['currentValue'] !== '')
        this.filterOptionsBasedOnParent();
    }
  }

  async filterOptionsBasedOnParent() {
    const  selectOptions  = this.selectOptions;
    if(this.isRemote){
      this.availableOptions = await this.getRemoteOptions(selectOptions.api)
    }else if (selectOptions && selectOptions.parent && this.parentValue) {
      this.availableOptions = selectOptions.options.filter((option: any) => option.parent === this.parentValue);
    } else {
      this.availableOptions = selectOptions.options;
    }
  }

  onValueChange(event: any) {
    this.selectedValue = event.detail.value;
    this.valueChange.emit(this.selectedValue);
  }

  async openCustomSelect() {
    const modal = await this.modalController.create({
      component: ModalListComponent,
      /* componentProps: {
        selectedValues: this.selectedValues,
        isMultiple: this.isMultiple,
      } */
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      //this.selectedValues = data;
    }
  }

  async getRemoteOptions(api: any,queryString?:any): Promise<any[]> {
    let res = []
    if(this.parentValue){
      queryString = `/${this.parentValue}`
    }
    try {
      res = await  this.formService.getData(api,queryString);
    } catch (error) {
      console.log('Select?',error)
    }
    

    return res
  }
}
