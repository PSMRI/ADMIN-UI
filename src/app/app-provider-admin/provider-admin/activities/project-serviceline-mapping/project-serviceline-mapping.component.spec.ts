import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectServicelineMappingComponent } from './project-serviceline-mapping.component';

describe('ProjectServicelineMappingComponent', () => {
  let component: ProjectServicelineMappingComponent;
  let fixture: ComponentFixture<ProjectServicelineMappingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectServicelineMappingComponent],
    });
    fixture = TestBed.createComponent(ProjectServicelineMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
