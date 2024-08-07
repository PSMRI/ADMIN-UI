import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectConfigutationScreenComponent } from './project-configutation-screen.component';

describe('ProjectConfigutationScreenComponent', () => {
  let component: ProjectConfigutationScreenComponent;
  let fixture: ComponentFixture<ProjectConfigutationScreenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectConfigutationScreenComponent],
    });
    fixture = TestBed.createComponent(ProjectConfigutationScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
