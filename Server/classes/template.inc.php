<?php

class Template {

    protected $file;
    protected $values = array();
  
    public function __construct($file) {
        $this->file = $file;
    }

    public function set($key, $value) {
        $this->values[$key] = $value;
    }
      
    public function render() {

        if (!file_exists($this->file)) {
            return "Error loading file: " .$this->file .".";
        }

        $html = file_get_contents($this->file);
      
        foreach ($this->values as $key => $value) {
            $replace = "{{" .$key ."}}";
            $html = str_replace($replace, $value, $html);
        }
      
        return $html;

    }

}
