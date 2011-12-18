function die(s) {
    throw ("Error: " + s);
}

function advance_to_matching_brace(program, pc) {
    var level = 0;
    var program_size = program.length;
    while ((0 <= pc) && (pc < program_size)) {
        switch(program.charAt(pc)) {
            case '[':
                level += 1;
                break;
            case ']':
                level -= 1;
                if (level == 0) {
                    return pc;
                }
                break;
            default:
        }
        pc += 1;
    }
    die('unmatched [');
}

function rewind_to_matching_brace(program, pc) {
    var level = 0;
    var program_size = program.length;
    while ((0 <= pc) && (pc < program_size)) {
        switch(program.charAt(pc)) {
            case '[':
                level -= 1;
                if (level == 0) {
                    return pc;
                }
                break;
            case ']':
                level += 1;
                break;
            default:
        }
        pc -= 1;
    }
    die('unmatched ]');
}

function bf_interp(stdin, stdout, program) {
    // input handling
    var input_size = stdin.value.length;
    var ip = 0;
    function get_char() {
        if (ip < input_size) {
            return stdin.value.charCodeAt(ip++);
        } else {
            return 0;
        }
    }
    // output handling
    stdout.value = "";
    function put_char(c) {
        stdout.value = (stdout.value + String.fromCharCode(c));
    }
    // init bf machine
    var buff_size = 30000;
    var buff = new Array(buff_size);
    for (i = 0; i < buff_size; i++) {
        buff[i] = 0;
    }
    var dp = 0;
    var program_size = program.value.length;
    var pc = 0;

    var chunk_duration = 1000;
    var delay_after_chunk = 50;

    function interp_chunk() {
        while(pc < program_size) {
            switch(program.value.charAt(pc)) {
                case '+':
                    buff[dp] = (buff[dp] + 1) % 256;
                    break;
                case '-':
                    buff[dp] = (buff[dp] - 1) % 256;
                    break;
                case '<':
                    if (dp == 0) {
                        die("dp ran off left end of buff");
                    } else {
                        dp--;
                    }
                    break;
                case '>':
                    if (dp == (buff_size - 1)) {
                        die("dp ran off right end of buff");
                    } else {
                        dp++;
                    }
                    break;
                case '[':
                    if (buff[dp] == 0) {
                        pc = advance_to_matching_brace(program.value, pc);
                    }
                    break;
                case ']':
                    if (buff[dp] != 0) {
                        pc = rewind_to_matching_brace(program.value, pc);
                    }
                    break;
                case '.':
                    put_char(buff[dp]);
                    break;
                case ',':
                    buff[dp] = get_char();
                    break;
                default:
            }
            pc++;
            if ((pc % chunk_duration) == 0) {
                // TODO : scroll stdout to the end somehow ...
                setTimeout(interp_chunk, delay_after_chunk);
                break;
            }
        }
    }

    // TODO : scroll stdout to the end somehow ...
    interp_chunk();
}

function bf_interp_run() {
    bf_interp(document.f.stdin, document.f.stdout, document.f.code);
}
