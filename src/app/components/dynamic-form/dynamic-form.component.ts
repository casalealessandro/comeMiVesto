import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import {DynamicFormField} from '../../service/interface/dynamic-form-field'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AnagraficaService } from 'src/app/service/anagrafica-service';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],

  
})

export class DynamicFormComponent implements OnInit {

  
  @Input() service: string | undefined;
  @Output() submitFormEvent: EventEmitter<any> = new EventEmitter<any>(); //Emit all'esterno;
  form: FormGroup = new FormGroup({});
  dataSet:any=[]
  fields: DynamicFormField[] = [];
  formShow:boolean=false
  constructor(private templateService: AnagraficaService,private formBuilder: FormBuilder) {

   
   }

  ngOnInit(): void {
    
    if(!this.service){
      return 
    }

    this.templateService.getFormFields(this.service).subscribe(fields => {
      this.fields = fields;
      this.initializeForm();
    });
  }

  initializeForm() {
    let formGroup = new FormGroup({});
    this.fields.forEach(field => {
      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }
      if (typeof field.minlength != 'undefined') {
        validators.push(Validators.minLength(field.minlength));
      }
      if (typeof  field.maxlength != 'undefined') {
        validators.push(Validators.maxLength(field.maxlength));
      }

      formGroup.addControl(field.name, new FormControl('', validators));

      if(field.type === 'selectBox'){

      }
    });

    this.form = formGroup

   
  }

  submitForm() {
    if (this.form.valid) {
      this.submitFormEvent.emit(this.form.value);
    } else {
      console.error('Form is invalid');
    }
  }

}
