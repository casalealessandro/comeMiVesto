import { FormControl, FormGroup } from '@angular/forms';
import { DynamicFormComponent } from './dynamic-form.component';

describe('DynamicFormComponent field control', () => {
  it('updates the FormControl and UI-backed formValues generically', () => {
    const component = Object.create(DynamicFormComponent.prototype) as DynamicFormComponent;
    component.form = new FormGroup({ consent: new FormControl(false) });
    component.formValues = { consent: false };

    component.setFieldValue('consent', true);

    expect(component.form.get('consent')?.value).toBeTrue();
    expect(component.formValues['consent']).toBeTrue();
  });
});
