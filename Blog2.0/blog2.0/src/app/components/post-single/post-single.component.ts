import { Component, Input, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';
import 'rxjs/add/operator/switchMap';
import * as _ from 'lodash';
import * as $ from 'jquery';

import { PostService } from '../../services/post/post.service';
import { PostModelService } from '../../services/post/postModelService.model'
import { Picture as PictureModelService} from '../../services/post/picture.model';
import { EditModeService } from '../../services/editmode/editmode.service';
import { ContentLayout } from '../../modules/contentLayout.module';
import { Post } from './post.model';
import { Picture } from './picture.model';


@Component({
  selector: 'app-post-single', 
  templateUrl: 'post-single.component.html',
  styleUrls: [
    '../../app.component.css',
    '../../../styles/buttons.css',
    '../../../styles/pictures.css',
    '../../../styles/modal.css',
    'post-single.component.css']
})

export class PostSingleComponent implements OnInit {
  @Input() post: Post;
  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private location: Location,
    private editmodeService : EditModeService,
  ) { }
  contentLayout: ContentLayout = new ContentLayout(1000, ["content", "sidebar"]);
  editable: boolean;
  oldPost: Post;
  editMode: boolean;
 

  ngOnInit(): void {
    this.getPost();
    this.contentLayout.getGridTemplate();
    this.editmodeService._editMode.subscribe((editMode: boolean) => this.editMode = this.checkIfPostIsUnderEdition(editMode));
  }

  @HostListener('window:resize', ['$event'])
  onResize(event : Event) {
    this.contentLayout.getGridTemplate();
  }

  getPost(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    this.postService.getPost(id)
    .subscribe((postModelService: PostModelService) => this.post = this.mapToPost(postModelService));
  }
  
  checkIfPostIsUnderEdition(editMode: boolean) {
    if (this.editable && !editMode) {
      $('#changes-modal').css({ display: "block" });
    }
    return editMode;
  }

  // button methods
  goBack(): void {
    this.location.back();
  }

  showDeleteModal(){
    $('#delete-modal').css({ display: "block" });
  }
  
  delete() {
      let postModelService = this.mapToPostModelService(this.post);
      this.postService.deletePost(postModelService).subscribe(() => this.goBack());
      this.closeModal();
  }
  
  edit() {
    this.oldPost = Object.assign({}, this.post);
    this.toggleEditable();
  }

  save() {
    let postModelService = this.mapToPostModelService(this.post);
    this.postService.updatePost(postModelService).subscribe(() => this.toggleEditable());
  }
  
  cancel() {
    this.discardChanges();
  }

  toggleEditable() {
    this.editable = !this.editable;
  }

  discardChanges() {
    this.post = Object.assign({}, this.oldPost);
    this.toggleEditable();
  }
  
  confirmLeavingEdition() {
    this.discardChanges();
    this.closeModal();
  }
  
  closeModal() {
    $('.modal').css({ display: "none" });
  }

  closeInfo(){
    $('.info').css({ display: "none" });    
  }

  // mapping methods
  findMainPicture(pictures: Picture[]): Picture {
    return pictures[_.findIndex(pictures, (x: Picture) => x.isMain)];
  }
  
  mapToPost(postModelService: PostModelService): Post {
    let pictures: Picture[] = this.mapPictures(postModelService.Pictures);
    let mainPicture: Picture = this.findMainPicture(pictures)
  
    return {
      id: postModelService.Id,
      title: postModelService.Title,
      text: postModelService.Text,
      pictures: pictures,
      mainPicture: mainPicture
    };
  }
  
  mapPictures(picturesList: PictureModelService[]): Picture[] {
    let pictures: Picture[] = [];
  
    picturesList.forEach(pic => {
      pictures.push(this.mapPicture(pic));
    });
  
    return pictures;
  }
  
  mapPicture(pic: PictureModelService): Picture {
    return {
      url: pic.Url,
      title: pic.Title,
      isMain: pic.IsMain
    }
  }
  
  mapToPostModelService(post: Post): PostModelService {
    let pictures = this.mapPostModelServicePictures(post.pictures);
  
    return {
      Id: post.id,
      Title: post.title,
      Text: post.text,
      Pictures: pictures,
    }
  }
  
  mapPostModelServicePictures(picturesList: Picture[]): PictureModelService[] {
    let pictures: PictureModelService[] = [];
  
    picturesList.forEach(pic => {
      pictures.push(this.mapPostModelServicePicture(pic));
    });
  
    return pictures;
  }
  
  mapPostModelServicePicture(pic: Picture): PictureModelService {
    return {
      Url: pic.url,
      Title: pic.title,
      IsMain: pic.isMain,
    }
  }
}