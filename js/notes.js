let noteCourante = null;

/**
 * @param {Note} note
 */
function selectNote(note) {
    noteCourante = null;
    NoteFormView.hide();
    if (note == false) note = {titre: ""};
    let list = document.getElementById("noteListView");
    for (let index = 0; index < list.childElementCount; index++) {
        const element = list.children[index];
        let cond = element.innerHTML.trim() == note.titre.trim();
        if (cond) {
            element.classList.add("note_list_item-selected");
            NoteFormView.validate = () => {
                noteCourante.titre = NoteFormView.title.value;
                noteCourante.contenu = NoteFormView.content.value;
                NoteList.save();
                NoteList.refresh();
                NoteFormView.hide();
                MainMenuView.editBtn.onclick = () => {};
                MainMenuView.delBtn.onclick = () => {};
            };
            MainMenuView.editBtn.onclick = NoteFormView.validate;
            MainMenuView.delBtn.onclick = () => {
                NoteList.remove(noteCourante);
                NoteList.save();
                NoteList.refresh();
                NoteFormView.hide();
            };
            NoteFormView.display(note);
            noteCourante = note;
        } else element.classList.remove("note_list_item-selected")
    }
}

/**
 * @param titre {string} titre
 * @param contenu {string} contenu
 */
class Note {
    constructor(titre, contenu) {
        this.titre = titre;
        this.contenu = contenu;
        this.dateCreation = new Date();
        this.setTitre = function (titre) {
            this.titre = titre;
        }
        this.setContenu = function (contenu) {
            this.contenu = contenu;
        }
    }
}

class NoteFormView {
    static div = document.getElementById("noteForm");
    static view = document.getElementById("currentNoteView");
    static title = document.getElementById("form_add_note_title");
    static content = document.getElementById("form_add_note_text");
    static button = document.getElementById("form_add_note_valid");

    static display(note={titre: "", contenu: ""}) {
        NoteFormView.button.innerHTML = (note.titre == "")? "Ajouter" : "Modifier";
        NoteFormView.div.classList.remove("create_edit_note-hidden");
        NoteFormView.title.value = note.titre;
        NoteFormView.content.value = note.contenu;
        NoteFormView.button.onclick = this.validate;
        NoteFormView.view.innerHTML = new NoteView(note).makeHtml();
    }
    static hide() {
        NoteFormView.div.classList.add("create_edit_note-hidden");
    }
    static validate() {}
}

class NoteView {
    /**
     * @param {Note} note 
     */
    constructor(note) {
        this.note = note;
        this.noteListView = document.getElementById("noteListView");
    }
    /**
     * Builds html text from markdown string
     * @param {string} content the markdown string to convert
     * @returns {string} the html text
     */
    makeHtml() {
        return new showdown.Converter().makeHtml("**"+this.note.titre+"**:<br>"+this.note.contenu);
    }
    displayNote() {
        let div = document.createElement("div");
        div.classList.add("note_list_item");
        div.innerHTML = this.note.titre;
        this.noteListView.appendChild(div);
        div.onclick = ()=>{
            if (this.note.titre == noteCourante?.titre) selectNote(false);
            else selectNote(this.note);
        };
    }
}

class NoteList {
    /**@type {Note[]} */
    static noteList = [];
    static addNote(note) {
        if (note.titre == "") return;
        let exists = false;
        for (let index = 0; index < NoteList.noteList.length; index++)
            if (NoteList.noteList[index].titre == note.titre) exists = true;
        if (exists) return;
        NoteList.noteList.push(note);
        NoteListView.displayItem(note);
        return NoteList.noteList.length-1;
    }

    static remove(note) {
        let index = -1;
        for (let i = 0; i < NoteList.noteList.length; i++)
            if (NoteList.noteList[i].titre == note.titre) index = i;
        if (index == -1) return;
        NoteList.noteList.splice(index, 1);
    }

    static get(index) {
        if (index < 0 || index >= NoteList.noteList.length) return null;
        return NoteList.noteList[index];
    }

    static getList() {
        return NoteList.noteList;
    }

    static save() {
        let str = JSON.stringify(NoteList.noteList);
        localStorage.setItem("noteList", str);
    }

    static load() {
        let data = JSON.parse(localStorage.getItem("noteList"));
        NoteList.noteList = (data == null)? [] : data;
        selectNote(false);
        NoteListView.refresh();
    }

    static refresh() {
        NoteListView.refresh();
    }
}

class NoteListView {
    static div = document.getElementById("noteListView");

    static displayItem(note) {
        let view = new NoteView(note);
        view.displayNote();
    }

    static refresh() {
        while (NoteListView.div.firstChild)
            NoteListView.div.firstChild.remove();
        NoteList.getList().forEach(note => {
            NoteListView.displayItem(note);
        });
    }
}

class MainMenuView {
    static addBtn = document.getElementById("add");
    static editBtn = document.getElementById("edit");
    static delBtn = document.getElementById("del");

    static init() {
        MainMenuView.addHandler();
    }

    static addHandler() {
        MainMenuView.addBtn.onclick = () => {
            selectNote(false);
            NoteFormView.validate = () => {
                let note = new Note(NoteFormView.title.value, NoteFormView.content.value);
                NoteList.addNote(note);
                NoteList.save();
                NoteList.refresh();
                NoteFormView.hide();
            };
            NoteFormView.display();
        };        
        MainMenuView.editBtn.onclick = () => {

        };
        MainMenuView.delBtn.onclick = () => {
        
        };
    }
}

MainMenuView.init();
NoteList.load();