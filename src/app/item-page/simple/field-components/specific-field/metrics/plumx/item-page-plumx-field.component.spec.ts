import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemPagePlumxFieldComponent } from './item-page-plumx-field.component';

describe('ItemPagePlumxFieldComponent', () => {
  let component: ItemPagePlumxFieldComponent;
  let fixture: ComponentFixture<ItemPagePlumxFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemPagePlumxFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemPagePlumxFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
