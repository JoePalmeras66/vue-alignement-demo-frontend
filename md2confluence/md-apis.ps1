# For documentation please check https://dev.azure.com/TGW-Software/Markdown2Confluence
function GetMDTitleFromFileName([System.IO.FileInfo] $FullFilePath)
{   
    $filename = $FullFilePath.Name
    $filename = $filename -replace $fullFilePath.Extension , ''
    $filename = StripDelimiter $filename
    return $filename
}

function GetMDParentFromFileName([System.IO.FileInfo] $FullFilePath, [string] $docsRoot)
{
    $fullname = $FullFilePath.Directory.FullName 

    if($fullname -eq $docsRoot){
        Write-Host "  | No parent found : '$fullname'"
        return ""
    }
    
    $parentDir = $FullFilePath.Directory.Name
    $parentDir = StripDelimiter $parentDir

    return $parentDir
}

function GetMDTitle([string] $FullFilePath)
{
    return $FullFilePath
}

function GetFriendlyBranchName([string] $Branch)
{
    if($Branch -like "Release"){
        $Branch = $Branch -replace 'Release/',''
        return StripDelimiter $Branch
    }
    return $Branch
}

function StripDelimiter([string] $name){
    $transformed = $name -replace '/' , ' ' 
    $transformed = $transformed -replace '-' , ' '
    return $transformed
}

function Inject-MD-Header([string] $mdFile, [string] $space, [string] $parent, [string] $title, [string] $branchid, [string] $pageFooter){

    $NewLine = "`r`n"
    $friendlyBranch = GetFriendlyBranchName $branchid

    $originalContent = [System.IO.File]::ReadAllText($mdFile)

    # This Regex matches for all links within the .md file. 
    # - The first capturing group matches a (optional) preceeding '!', which indicates the link is an image (in which case we can ignore the link)
    # - The third capturing group matches the url of the link, which we currently only process if the link is to another local md-file
    # - The second and forth capturing group match the surrounding parts of the link, which are used to reconstruct the link after the url is replaced.
    $originalContent | 
    Select-String '(\!?)(\[\w+\]\()((?:[\w.]+\/)*(?:\/?\w+\.\w+))(\))' -AllMatches |
    Select-Object -ExpandProperty Matches | 
    Sort-Object -Property Value -Unique |
    ForEach-Object {
        # If capture group 1 is not empty, it is a reference to an image. Otherwise its a link.
        # To prevent renaming of web-urls, check for .md file-ending
        if ( ($_.Groups[1].Length -eq 0) -and ($_.Groups[3] -match ".md$") ){
            # Create a "md-reference" by extracting the filname from the path, and adding the branch to it (which equals the page-title of the referenced page).
            # Then replace the file-reference with the md-reference and use the resulting value to replace all occurences (of the file) in the document content.
            # Syntax for links to other confluence pages in mark is: [name](ac:TITLE) - where the TITLE is the title of the page you want to link to.
            $mdRef = "$(GetMDTitleFromFileName -FullFilePath $_.Groups[3].Value) ($friendlyBranch)"
            $originalContent = $originalContent -replace [regex]::Escape($_.Value), "$($_.Groups[2].Value)<ac:$mdRef>$($_.Groups[4].Value)"
        }
    }

    $header = (
        "<!-- Space: $space -->", 
        "<!-- Parent: $parent -->",
        "<!-- Title: $title -->",
        "<!-- Label: $branchid -->",
        "<!-- Label: Markdown2Confluence -->" -join $NewLine)

    Write-Debug "Set Header: $NewLine$header"

    $newContent = "$header$originalContent$NewLine$NewLine$NewLine$pageFooter"
    [System.IO.File]::WriteAllText($mdFile, $newContent)
}