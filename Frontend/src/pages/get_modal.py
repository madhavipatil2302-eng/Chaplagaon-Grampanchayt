import codecs

with codecs.open('c:\\Grampanchayat\\Frontend\\src\\pages\\Home.backup.jsx', 'r', 'utf-16le') as f:
    lines = f.readlines()

modal_start = -1
modal_end = -1
for i, line in enumerate(lines):
    if '{selectedRoleMember && (' in line:
        modal_start = i
    if modal_start != -1 and line.strip() == ')}' and i > modal_start + 70:
        modal_end = i
        break

print('Modal lines:', modal_start, 'to', modal_end)
if modal_start != -1 and modal_end != -1:
    with open('modal_snippet.txt', 'w', encoding='utf-8') as f:
        f.writelines(lines[modal_start:modal_end+1])
